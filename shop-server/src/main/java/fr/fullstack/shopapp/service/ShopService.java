package fr.fullstack.shopapp.service;

import fr.fullstack.shopapp.dto.ShopDto;
import fr.fullstack.shopapp.model.OpeningHoursShop;
import fr.fullstack.shopapp.model.Product;
import fr.fullstack.shopapp.model.Shop;
import fr.fullstack.shopapp.repository.ShopRepository;

import org.hibernate.search.mapper.orm.Search;
import org.hibernate.search.mapper.orm.massindexing.MassIndexer;
import org.hibernate.search.mapper.orm.session.SearchSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ShopService {
    @PersistenceContext
    private EntityManager em;

    @Autowired
    private ShopRepository shopRepository;

    public ShopService(ShopRepository shopRepository) {
        this.shopRepository = shopRepository;
    }

    @Transactional
    public Shop createShop(Shop shop) throws Exception {
        for(OpeningHoursShop openingHoursShop : shop.getOpeningHours()) {
            if (openingHoursShop.getOpenAt().isAfter(openingHoursShop.getCloseAt())) {
                throw new Exception("OpenAt should be before CloseAt");
            }
            long day = openingHoursShop.getDay();
            if (day < 1 || day > 7) {
                throw new Exception("Day should be between 1 and 7");
            }
            List<OpeningHoursShop> sameDayOpeningHours = shop.getOpeningHours().stream()
                    .filter(o -> o.getDay() == day)
                    .filter(o -> o.getId() != openingHoursShop.getId())
                    .toList();
            for (OpeningHoursShop sameDayOpeningHour : sameDayOpeningHours) {
                if (openingHoursShop.getOpenAt().isBefore(sameDayOpeningHour.getCloseAt())
                        && openingHoursShop.getCloseAt().isAfter(sameDayOpeningHour.getOpenAt())) {
                    throw new Exception("Opening hours should not overlap for the same day");
                }
            }
        }
        try {
            Shop newShop = shopRepository.save(shop);
            // Refresh the entity after the save. Otherwise, @Formula does not work.
            em.flush();
            em.refresh(newShop);
            return newShop;
        } catch (Exception e) {
            throw new Exception(e.getMessage());
        }
    }

    @Transactional
    public void deleteShopById(long id) throws Exception {
        try {
            Shop shop = getShop(id);
            // delete nested relations with products
            deleteNestedRelations(shop);
            shopRepository.deleteById(id);
        } catch (Exception e) {
            throw new Exception(e.getMessage());
        }
    }

    public Shop getShopById(long id) throws Exception {
        try {
            return getShop(id);
        } catch (Exception e) {
            throw new Exception(e.getMessage());
        }
    }

    public Page<ShopDto> getShopList(
            Optional<String> sortBy,
            Optional<Boolean> inVacations,
            Optional<String> createdBefore,
            Optional<String> createdAfter,
            Pageable pageable
    ) {
        // SORT
        if (sortBy.isPresent()) {
            switch (sortBy.get()) {
                case "name":
                    pageable = PageRequest.of(
                        pageable.getPageNumber(), pageable.getPageSize(), Sort.by("name").ascending()
                    );
                    break;
                case "createdAt":
                    pageable = PageRequest.of(
                        pageable.getPageNumber(), pageable.getPageSize(), Sort.by("createdAt").ascending()
                    );
                    break;
                case "nbProducts":
                    pageable = PageRequest.of(
                        pageable.getPageNumber(), pageable.getPageSize(), Sort.by("products").ascending()
                    );
                    break;
                default:
                    pageable = PageRequest.of(
                        pageable.getPageNumber(), pageable.getPageSize(), Sort.by("id").ascending()
                    );
                    break;
            }
        }

        // FILTERS
        Page<Shop> shopList = getShopListWithFilter(inVacations, createdBefore, createdAfter, pageable);
        if (shopList != null) {
            return shopList.map(this::shopToDto);
        }

        // NONE
        return shopRepository.findAll(pageable).map(this::shopToDto);
    }

    @Transactional
    public Shop updateShop(Shop shop) throws Exception {
        try {
            getShop(shop.getId());
            return this.createShop(shop);
        } catch (Exception e) {
            throw new Exception(e.getMessage());
        }
    }

    public List<ShopDto> fullTextShopSearch(String text, Optional<Boolean> inVacations, Optional<String> createdAfter, Optional<String> createdBefore) {
        SearchSession searchSession = Search.session(em);
        var boolQuery = searchSession.search(Shop.class).where(f -> f.bool().with(b -> {
            b.must(f.queryString().field("name").matching(text));
            inVacations.ifPresent(v -> b.must(f.match().field("inVacations").matching(v)));
            createdAfter.ifPresent(date -> b.must(f.range().field("createdAt").greaterThan(LocalDate.parse(date))));
            createdBefore.ifPresent(date -> b.must(f.range().field("createdAt").lessThan(LocalDate.parse(date))));
        }));
        return boolQuery.fetchAllHits().stream().map(this::shopToDto).collect(Collectors.toList());
    }

    public void reindexShops() throws InterruptedException {
        SearchSession searchSession = Search.session(em);
        MassIndexer indexer = searchSession.massIndexer( Shop.class ) 
        .threadsToLoadObjects( 7 );
        indexer.startAndWait();
    }

    private void deleteNestedRelations(Shop shop) {
        List<Product> products = shop.getProducts();
        for (int i = 0; i < products.size(); i++) {
            Product product = products.get(i);
            product.setShop(null);
            em.merge(product);
            em.flush();
        }
    }

    private Shop getShop(Long id) throws Exception {
        Optional<Shop> shop = shopRepository.findById(id);
        if (!shop.isPresent()) {
            throw new Exception("Shop with id " + id + " not found");
        }
        return shop.get();
    }

    private Page<Shop> getShopListWithFilter(
            Optional<Boolean> inVacations,
            Optional<String> createdAfter,
            Optional<String> createdBefore,
            Pageable pageable
    ) {
        if (inVacations.isPresent() && createdBefore.isPresent() && createdAfter.isPresent()) {
            return shopRepository.findByInVacationsAndCreatedAtGreaterThanAndCreatedAtLessThan(
                    inVacations.get(),
                    LocalDate.parse(createdAfter.get()),
                    LocalDate.parse(createdBefore.get()),
                    pageable
            );
        }

        if (inVacations.isPresent() && createdBefore.isPresent()) {
            return shopRepository.findByInVacationsAndCreatedAtLessThan(
                    inVacations.get(), LocalDate.parse(createdBefore.get()), pageable
            );
        }

        if (inVacations.isPresent() && createdAfter.isPresent()) {
            return shopRepository.findByInVacationsAndCreatedAtGreaterThan(
                    inVacations.get(), LocalDate.parse(createdAfter.get()), pageable
            );
        }

        if (inVacations.isPresent()) {
            return shopRepository.findByInVacations(inVacations.get(), pageable);
        }

        if (createdBefore.isPresent() && createdAfter.isPresent()) {
            return shopRepository.findByCreatedAtBetween(
                    LocalDate.parse(createdAfter.get()), LocalDate.parse(createdBefore.get()), pageable
            );
        }

        if (createdBefore.isPresent()) {
            return shopRepository.findByCreatedAtLessThan(
                    LocalDate.parse(createdBefore.get()), pageable
            );
        }

        if (createdAfter.isPresent()) {
            return shopRepository.findByCreatedAtGreaterThan(
                    LocalDate.parse(createdAfter.get()), pageable
            );
        }

        return null;
    }

    private ShopDto shopToDto(Shop shop) {
        ShopDto dto = new ShopDto();
        dto.setId(shop.getId());
        dto.setCreatedAt(shop.getCreatedAt());
        dto.setInVacations(shop.getInVacations());
        dto.setName(shop.getName());
        dto.setNbProducts(shop.getNbProducts());
        dto.setOpeningHours(shop.getOpeningHours());
        dto.setProducts(shop.getProducts());
        dto.setNumberOfCategories(shop.getProducts().stream()
            .flatMap(product -> product.getCategories().stream())
            .collect(Collectors.toSet()).size());
        return dto;
    }
}

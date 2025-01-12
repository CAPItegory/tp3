import Loader from './Loader';
import { JSX } from 'react';
import NavBar from './NavBar';

type Props = {
    children: JSX.Element;
};

const Layout = ({ children }: Props) => {

    return (
        <div>
            <NavBar />

            <Loader />
            <div>{children}</div>
        </div>
    );
};

export default Layout;

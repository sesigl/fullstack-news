import "reflect-metadata"
import SortMode from "../../libs/interfaces/SortMode";
import Home, {getStaticProps as getStaticPropsFromHome} from "../index";

export default Home;

export const getStaticProps = getStaticPropsFromHome

export async function getStaticPaths() {
    return {
        paths: [
            {
                params: {sort: SortMode.HOT},
            }, {
                params: {sort: SortMode.NEW},
            }, {
                params: {sort: SortMode.TOP},
            },
        ],
        fallback: 'blocking',
    };
}

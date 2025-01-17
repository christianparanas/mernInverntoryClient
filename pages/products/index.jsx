import Nav from "../../components/Nav";
import Image from "next/image";

import Link from "next/link";
import { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useCookies } from "react-cookie";
import { isExpired, decodeToken } from "react-jwt";
import { useRouter } from "next/router";

import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { motion } from "framer-motion";

export default function products() {
  const [cookies, setCookie, removeCookie] = useCookies(["user"]);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [stateDB, setStateDB] = useState("Loading..");
  const [hasProductsInDB, setHasProductsInDB] = useState(false);
  const router = useRouter();

  useEffect(async () => {
    await checkAuth();

    axios
      .get(process.env.BACKEND_BASEURL + "/products")
      .then((res) => {
        setProducts(res.data.result);

        // check if there's a product in db, if none, set the message to no item
        if (res.status == 202) {
          setStateDB("There's no item added");
        } else {
          // if there's a product, show the product map function
          setHasProductsInDB(true);
        }
      })
      .catch((error) => {
        if (!error.status) {
          toast.error("Network Error!", { autoClose: 2000 });
          setStateDB("Network error, Please check your internet connection.");
        }
        console.log(error);
      });
  }, [cookies]);

  const checkAuth = async () => {
    if (cookies.user) {
      // verify token if valid or not expired
      const isMyTokenExpired = await isExpired(cookies.user.token);
      console.log(`is token expired? - ${isMyTokenExpired}`);

      // if expired, redirect to login page
      if (isMyTokenExpired == true) {
        logout();
      } else {
        setLoading(true);
      }
    }
  };

  const logout = () => {
    removeCookie("user");
  };

  return (
    <>
      <div className="products">
        <ToastContainer />
        <Nav />

        {hasProductsInDB ? (
          <div className="products_grid">
            <h3>Products</h3>
            <ResponsiveMasonry
              columnsCountBreakPoints={{ 450: 2, 750: 4, 900: 6 }}
            >
              <Masonry columnsCount={2} gutter="15px">
                {products.map((val, key) => {
                  return (
                    <motion.div className="p_con" key={key}>
                      <Link
                        href={{ pathname: "/products/" + `${val.product_id}` }}
                        as={`/products/${val.product_id}`}
                      >
                        <Image
                          width="100"
                          height="100"
                          layout="responsive"
                          src={`https://res.cloudinary.com/christianparanas/image/upload/v1617305941/Ecommerce/Products/${val.product_image}`}
                          alt="product image"
                        />
                      </Link>
                      <div className="qq">
                        <h3>{val.product_name}</h3>
                        <p>₱{val.product_price.toLocaleString()}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </Masonry>
            </ResponsiveMasonry>
          </div>
        ) : (
          <div></div>
        )}
      </div>
    </>
  );
}

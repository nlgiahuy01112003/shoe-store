import React, { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { RiShoppingBagLine } from "react-icons/ri";
import { useForm } from "react-hook-form";
import { getImgUrl } from "../../util/getImageUrl";
import {
  clearCart,
  removeFromCart,
} from "../../redux/features/carts/cartSlice";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext";
import {
  useDeleteCartMutation,
  useFetchCartByUserIdQuery,
} from "../../redux/features/carts/cartsApi";
import { setCartCount } from "../../redux/features/status/statusSlice";

const Cart = () => {
  const { currentUser } = useAuth();

  const userData = JSON.parse(localStorage.getItem("user"));
  const userId = userData?.id;

  const { data: cartItemsFromDB = [] } = useFetchCartByUserIdQuery(userId);
  const [deleteCart] = useDeleteCartMutation();

  const dispatch = useDispatch();
  const cartItemsFromStore = useSelector((state) => state.cart.cartItems);
  const [cartItems, setCartItems] = useState([]);
  const cartCount = useSelector((state) => state.status.cartCount);

  useEffect(() => {
    if (currentUser && cartItemsFromDB.length > 0) {
      setCartItems(cartItemsFromDB);
    } else {
      setCartItems(cartItemsFromStore);
    }
  }, [currentUser, cartItemsFromDB, cartItemsFromStore]);

  const handleRemoveFromCart = async (cart) => {
    try {
      if (currentUser) {
        console.log(cart);
        await deleteCart(cart.id).unwrap();
        console.log(cart.id);
        setCartItems((prev) => prev.filter((item) => item.id !== cart.id));
      } else {
        dispatch(removeFromCart(cart));
      }
      Swal.fire({
        position: "center",
        icon: "success",
        title: "Sản phẩm đã xóa",
        showConfirmButton: false,
        timer: 1500,
      });
      dispatch(setCartCount(Math.max(cartCount - 1, 0)));
    } catch (error) {
      console.error("Lỗi xóa sản phẩm:", error);
      Swal.fire({
        position: "center",
        icon: "error",
        title: "Xóa sản phẩm thất bại",
        showConfirmButton: false,
        timer: 1500,
      });
    }
  };

  const handleClearCart = async () => {
    try {
      if (currentUser) {
        const deletePromises = cartItems.map((cart) =>
           deleteCart(cart.id).unwrap()
        );
        await Promise.all(deletePromises);
        setCartItems([]);
      } else {
        dispatch(clearCart());
      }

      dispatch(setCartCount(0));

      Swal.fire({
        position: "center",
        icon: "success",
        title: "Đã xóa toàn bộ giỏ hàng",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      console.error("Lỗi khi xóa giỏ hàng:", error);
      Swal.fire({
        position: "center",
        icon: "error",
        title: "Xóa giỏ hàng thất bại",
        showConfirmButton: false,
        timer: 1500,
      });
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => console.log(data);
  return (
    <>
      <div className="my-12 px-12 ">
        <div>
          <div className="px-3 mx-2">
            <div className="mx-[-12px] grid grid-cols-1 lg:grid-cols-12 bg-white drop-shadow-xl rounded-xl">
              {/* cart item */}
              <div className="p-4 col-span-8">
                <div>
                  {/* title */}
                  <div className="p-4">
                    <p className="text-lg mb-2">Giỏ hàng</p>
                  </div>

                  {/* cart item */}
                  <div>
                    {/* single item */}
                    {cartItems.map((cart) => (
                      <div
                        key={`carts-${cart.id}`}
                        className="grid grid-cols-12 "
                      >
                        {/* img */}
                        <div className="p-4 col-span-12 md:col-span-3">
                          <img
                            className="lg:w-[150px] lg:h-[150px] rounded-xl object-contain"
                            src={`${getImgUrl(cart.images[0].link)}`}
                            alt={cart.name}
                          />
                        </div>
                        {/* item-info */}
                        <div className="col-span-12 md:col-span-9">
                          <div className="p-4">
                            <div className="mx-[-12px]">
                              <div className="px-3">
                                <p className="text-lg mb-2">{cart.name}</p>
                                <div className="d-flex gap-3 align-items-center">
                                  <p className="text-base mb-4 text-orange-500">
                                    {cart.price} VNĐ
                                  </p>
                                </div>
                                <div className="flex justify-between mb-4 flex-wrap gap-2">
                                  <div>
                                    <span className="text-semibold">
                                      Thương hiệu:
                                    </span>
                                    <span>{cart.brand.name}</span>
                                  </div>
                                  <div>
                                    <span className="text-semibold">Size:</span>
                                    <span>{cart.size}</span>
                                  </div>
                                  <div>
                                    <span className="text-semibold">SL:</span>
                                    <span>{cart.quantity}</span>
                                  </div>
                                  <div>
                                    <span className="text-semibold">
                                      Màu sắc:
                                    </span>
                                    <span>{cart.color}</span>
                                  </div>
                                </div>
                                <div className="text-red-700">
                                  <FaTrash
                                    className="cursor-pointer"
                                    onClick={() => handleRemoveFromCart(cart)}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="my-5 w-full border-b border-gray-200"></div>

                  {/* btn */}
                  <div className="mx-[-12px]">
                    <div className="mt-4 px-3">
                      <div className="w-full">
                        <div className="mx-[-12px] text-white flex flex-col lg:flex-row ">
                          {/* icon left */}
                          <div className="group max-w-[180px] px-3 mb-4 pr-0 bg-green-500 inline-flex items-center justify-center rounded ml-7 group-hover:px-0">
                            <Link
                              to="/san-pham"
                              className="flex items-center justify-center gap-4 relative w-full"
                            >
                              <span className="text-base p-2 mr-10">
                                Mua thêm hàng
                              </span>
                              <div className="absolute right-0 bg-green-600 flex h-10 w-10 items-center justify-center rounded text-white transition-all duration-500 group-hover:w-[calc(100%+12px)]">
                                <RiShoppingBagLine />
                              </div>
                            </Link>
                          </div>

                          {/* icon right */}
                          <div className="group max-w-[180px] px-3 mb-4 pr-0 bg-red-500 inline-flex items-center justify-center rounded ml-7 group-hover:px-0">
                            <Link
                              to="#"
                              onClick={handleClearCart}
                              className="flex items-center justify-center gap-4 relative w-full"
                            >
                              <span className="text-base p-2 mr-10 w-[100%]">
                                Xóa giỏ hàng
                              </span>
                              <div className="absolute right-0 bg-red-600 flex h-10 w-10 items-center justify-center rounded text-white transition-all duration-500 group-hover:w-[calc(100%+12px)]">
                                <FaTrash />
                              </div>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* checkout */}
              <div className="col-span-4 p-4">
                <h4 className="text-center mb-4 p-4 text-lg">Thanh toán</h4>
                <form action="" method="POST" onSubmit={handleSubmit(onSubmit)}>
                  <label className="block text-gray-400 text-sm mb-2">
                    Mã giảm giá
                  </label>
                  <input
                    type="text"
                    {...register("coupon")}
                    className="w-full mb-6 p-2 rounded border-solid border-1 border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-300 px-3 py-[6px]"
                    placeholder="Nhập tại đây..."
                  />
                  {errors.name && (
                    <p className="text-red-500 font-thin text-sm mt-1">
                      {errors.name.message}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="rounded bg-black text-white w-full p-[6px]"
                  >
                    Kiểm tra
                  </button>
                </form>
                <div className="my-5 w-full border-b border-gray-200"></div>

                <div className="flex justify-between">
                  <p className="font-medium text-base mb-2">TỔNG TIỀN: </p>
                  <p className="font-semibold text-base mb-2">
                    {cartItems.reduce((sum, item) => {
                      // const price = parseInt(item.price.replace(/\./g, ""), 10); // Chuyển "3.489.000" -> 3489000
                      const price = item.price;
                      return sum + price * item.quantity;
                    }, 0)}{" "}
                    VNĐ
                  </p>
                </div>
                <Link
                  to="/thanh-toan"
                  className="rounded bg-orange-500 text-white w-full p-[6px] block mt-2 text-center"
                >
                  Thanh toán
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cart;

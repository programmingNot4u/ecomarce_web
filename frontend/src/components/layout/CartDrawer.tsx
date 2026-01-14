import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import CartItem from '../cart/CartItem';

interface CartDrawerProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function CartDrawer({ open, setOpen }: CartDrawerProps) {
  const { cart, removeFromCart, total } = useCart();
  const navigate = useNavigate();

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-[80]" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-[#F3F4F6] shadow-xl">
                    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                      <div className="flex items-start justify-between border-b border-gray-200 pb-4 mb-6">
                        <Dialog.Title className="text-lg font-bold text-gray-900 uppercase tracking-widest">Shopping Bag</Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="relative -m-2 p-2 text-gray-400 hover:text-gray-500"
                            onClick={() => setOpen(false)}
                          >
                            <span className="sr-only">Close panel</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flow-root">
                          <ul role="list" className="space-y-4">
                            {cart.length === 0 ? (
                              <li className="py-20 text-center">
                                <p className="text-gray-400 font-medium">Your bag is empty.</p>
                                <button
                                  onClick={() => setOpen(false)}
                                  className="mt-4 text-primary font-bold uppercase text-xs tracking-widest hover:underline"
                                >
                                  Explore Shop
                                </button>
                              </li>
                            ) : (
                              cart.map((item) => (
                                <CartItem key={item.id} item={item} />
                              ))
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 bg-white px-4 py-6 sm:px-6 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                      <div className="flex justify-between text-base font-bold text-gray-900">
                        <p className="uppercase tracking-widest text-sm">Subtotal</p>
                        <p className="text-lg">৳{total.toLocaleString()}</p>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Shipping and taxes calculated at checkout.</p>
                      <div className="mt-8 space-y-3">
                        <div className="mt-8 space-y-3">
                          <button
                            type="button"
                            className="w-full flex items-center justify-center rounded-none bg-primary px-6 py-4 text-sm font-bold text-white shadow-sm hover:bg-gray-800 transition-colors uppercase tracking-[0.2em]"
                            onClick={() => {
                              navigate('/checkout');
                              // Small delay to allow navigation to start before unmounting
                              setTimeout(() => setOpen(false), 100);
                            }}
                          >
                            Checkout Now
                          </button>
                          <button
                            type="button"
                            className="w-full flex items-center justify-center rounded-none border border-gray-300 bg-white px-6 py-3 text-xs font-bold text-gray-600 shadow-sm hover:bg-gray-50 transition-colors uppercase tracking-widest"
                            onClick={() => {
                              navigate('/cart');
                              // Small delay to allow navigation to start before unmounting
                              setTimeout(() => setOpen(false), 100);
                            }}
                          >
                            View Full Bag
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

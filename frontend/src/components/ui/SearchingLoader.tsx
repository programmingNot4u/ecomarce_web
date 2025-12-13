import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import searchingAnimation from '../../assets/lottie_animations/Searching.lottie?url';

const SearchingLoader = () => {
    return (
        <div className="flex flex-col items-center justify-center py-20 min-h-[60vh] overflow-hidden">
            <div className="w-full sm:w-full max-w-2xl px-4 transform scale-150 sm:scale-100 will-change-transform origin-center">
                <DotLottieReact
                    src={searchingAnimation}
                    loop
                    autoplay
                    style={{ width: '100%', height: '100%' }}
                />
            </div>
            <p className="text-gray-500 font-medium mt-4 animate-pulse">Searching for match...</p>
        </div>
    );
};

export default SearchingLoader;

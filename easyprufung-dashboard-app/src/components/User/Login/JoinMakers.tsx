import img1 from "../../../images/users/user7.jpg";
import img2 from "../../../images/users/user2.jpg";
import img3 from "../../../images/users/user3.jpg";
import img4 from "../../../images/users/user4.jpg";
import img5 from "../../../images/users/user5.jpg";
import img6 from "../../../images/users/user6.jpg";


const UserImages = [
    { src: img1, alt: 'User 1' },
    { src: img2, alt: 'User 2' },
    { src: img3, alt: 'User 3' },
    { src: img4, alt: 'User 4' },
    { src: img5, alt: 'User 5' },
    { src: img6, alt: 'User 6' },
];

const StarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-yellow-300 fill-current">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
);

const JoinMakers = () => {
    return (
        <div className="mt-8 text-center lg:text-left">
            <p className="text-lg font-semibold mb-3 text-black dark:text-white text-foreground">Join over 500 creators launching their ideas a single session with EasyPrüfung.</p>
            <div className="flex items-center justify-center lg:justify-start space-x-4">
                <div className="flex -space-x-3">
                    {UserImages.map((user, index) => (
                        <div key={index} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden">
                            <img src={user.src} alt={user.alt} width={40} height={40} className="object-cover" />
                        </div>
                    ))}
                </div>
                <div className="flex items-center">
                    {[...Array(5)].map((_, index) => (
                        <div key={index} className="opacity-1">
                            <StarIcon />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default JoinMakers;

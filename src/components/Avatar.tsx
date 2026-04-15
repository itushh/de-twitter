import avatar from '../assets/avatar.png';

const Avatar = ({ size }: { size: number }) => {
    return (
        <div>
            <img src={avatar} alt="avatar" className={`w-${size} h-${size} rounded-full shrink-0`} />
        </div>
    );
};

export default Avatar;
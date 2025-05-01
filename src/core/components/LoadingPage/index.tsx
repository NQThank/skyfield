import './LoadingPage.scss';

import loader from '@/assets/icons/loader.svg';

const LoadingPage = () => {
  return (
    <div className="flex items-center justify-center">
      <img src={loader} alt="Loader" height={60} />
    </div>
  );
};

export default LoadingPage;

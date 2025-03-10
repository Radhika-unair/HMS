import "react";
import Header from "../Header";
import SpecialityMenu from "../SpecialityMenu";
import TopDoctors from "../TopDoctors";
import Banner from "../Banner";

const Home = () => {
  return (
    <div>
      <Header />
      <SpecialityMenu />
      <TopDoctors />
      <Banner />
    </div>
  );
};

export default Home;

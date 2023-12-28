import Content from "components/content";
import HowItWorks from "components/HowItWorks";
import Banner from "components/Banner";
import SocialMedia from "components/SocialMedia";
// import { CompanyBanner } from "src/components/CompanyBanner";
import Trusted from "components/Trusted";
import JobBoard from "components/tesetjob/JobBoard";

function Home() {
  return (
    <div>
      <Content />
      <Trusted />
      <HowItWorks />
      <JobBoard Title={true} />
      {/* <CompanyBanner /> */}
      <SocialMedia />
      <Banner
        title="Ready to refer someone?"
        button="Explore the job board"
        link="/jobs"
      />
    </div>
  );
}

export default Home;

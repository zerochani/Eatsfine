import CtaSection from "@/components/main/CtaSection";
import FeatureSection from "@/components/main/FeatureSection";
import Footer from "@/components/main/Footer";
import ForOwnerSection from "@/components/main/ForOwnerSection";
import ForUserSection from "@/components/main/ForUserSection";
import Header from "@/components/main/Header";
import Hero from "@/components/main/Hero";
import ProblemSection from "@/components/main/ProblemSection";
import StateSection from "@/components/main/StateSection";

const Intro = () => {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ProblemSection />
        <FeatureSection />
        <ForUserSection />
        <ForOwnerSection />
        <StateSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
};

export default Intro;

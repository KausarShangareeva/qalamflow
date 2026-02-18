import HeroSection from "./components/HeroSection";
import FeaturesSection from "./components/FeaturesSection";
import Features from "./components/Features";
import StepByStepGuide from "./components/StepByStepGuide";
import EnvelopePreview from "./components/EnvelopePreview";
import PDFExport from "./components/PDFExport";
import FinalCTA from "./components/FinalCTA";

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <StepByStepGuide />
      <EnvelopePreview />
      <PDFExport />
      <Features />
      <FinalCTA />
    </>
  );
}

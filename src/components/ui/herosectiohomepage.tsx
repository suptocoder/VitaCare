
import Link from "next/link";
import { Button } from "@/components/ui/button";

function HeroSection() {
  return (
    <section
      style={{ backgroundImage: "url('/images/Advertising.jpeg')" }}
      className="py-24 bg-cover bg-center text-black"
    >
      <div className="container mx-auto px-6 text-center max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
          Transforming Healthcare Through Technology
        </h1>
        <p className="text-lg md:text-xl text-gray-700 mb-10">
          VitaCare provides a centralized platform for secure healthcare
          management — giving patients, doctors, and administrators seamless
          access to medical records.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/auth/login">
            <Button
              size="lg"
              className="px-8 bg-white text-primary hover:bg-white/90 shadow-md"
            >
              Log in
            </Button>
          </Link>
          <Link href="/auth?tab=register">
            <Button
              size="lg"
              className="px-8 bg-primary text-white hover:bg-primary/90 shadow-md"
            >
              Create an account
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;

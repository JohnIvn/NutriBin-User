import { Link } from "react-router-dom";
import { Button } from "../ui/Button";

export default function MainFooter() {
  return (
    <header className="flex w-full justify-between items-center h-20 bg-orange-500 text-white">
      <nav className="flex w-auto px-2">
        <div>
          <Button
            asChild
            className={"bg-transparent hover:bg-amber-700 font-bold"}
          >
            <Link to={"/about"}>About Us</Link>
          </Button>
          <Button
            asChild
            className={"bg-transparent hover:bg-amber-700 font-bold"}
          >
            <Link to={"/faqs"}>FAQs</Link>
          </Button>
          <Button
            asChild
            className={"bg-transparent hover:bg-amber-700 font-bold"}
          >
            <Link to={"/terms"}>Terms of Service</Link>
          </Button>
        </div>
        <div>
          <Button
            asChild
            className={"bg-transparent hover:bg-amber-700 font-bold"}
          >
            <Link to={"/socials"}>Socials</Link>
          </Button>
          <Button
            asChild
            className={"bg-transparent hover:bg-amber-700 font-bold"}
          >
            <Link to={"/studies"}>Studies</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}

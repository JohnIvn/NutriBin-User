import { Link } from "react-router-dom";
import { Button } from "../ui/Button";

export default function MainHeader() {
    return (
      <header className="flex w-full justify-between items-center h-12 bg-orange-500 text-white px-2">
        <Link to={"/"}>
          {" "}
          <img
            src="/NutriBin_Logo.svg"
            alt="NutriBin"
            className="h-8 px-4"
          />{" "}
        </Link>

        <nav className="flex w-auto px-2 gap-4">
          <Button
            asChild
            className={"bg-transparent hover:bg-amber-700 font-bold"}
          >
            <Link to={"/home"}> Home </Link>
          </Button>
          <Button
            asChild
            className={"bg-transparent hover:bg-amber-700 font-bold"}
          >
            <Link to={"/guide"}> Guide </Link>
          </Button>
          <Button
            asChild
            className={"bg-transparent hover:bg-amber-700 font-bold"}
          >
            <Link to={"/cameras"}> Cameras </Link>
          </Button>
          <Button
            asChild
            className={"bg-transparent hover:bg-amber-700 font-bold"}
          >
            <Link to={"/modules"}> Modules </Link>
          </Button>
          <Button
            asChild
            className={"bg-transparent hover:bg-amber-700 font-bold"}
          >
            <Link to={"/fertilizer"}> Fertilizer </Link>
          </Button>
        </nav>
      </header>
    );
}
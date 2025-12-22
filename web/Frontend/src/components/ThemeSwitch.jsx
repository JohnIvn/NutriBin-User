import { useState, useEffect } from "react"
import { SunIcon, MoonIcon } from "@heroicons/react/24/solid"

export default function ThemeSwitch() {
    const [isDark, setIsDark] = useState(
        () =>
            localStorage.theme === 'dark' ||
            (!('theme' in localStorage) &&
                window.matchMedia('(prefers-color-scheme: dark)').matches)
    );

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
        }
    }, [isDark]);
    

    return (
        <button
            onClick={() => setIsDark(!isDark)}
            className="transition-colors duration-300"
        >
            {isDark ? (
                <SunIcon className="w-6 h-6 text-yellow-500"/>
            ) : (
                <MoonIcon className="w-6 h-6 text-black"/>
            )}
        </button>
    )
}
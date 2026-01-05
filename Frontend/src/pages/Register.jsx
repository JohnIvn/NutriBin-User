import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { registration } from "@/schema/registration";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";

export default function Register() {
    const form = useForm({
        resolver: zodResolver(registration),
        defaultValues: {
            firstName: "",
            lastName: "",
            contactNumber: "",
            password: "",
            confirmPassword: "",
        },
    })

    function onSubmit(values){
        console.log(values)
    }

    return (
        <section className="flex w-full justify-between">
            <div className="hidden md:flex justify-center bg-[url('/Login.png')] bg-cover bg-center relative w-1/3 min-h-full">
                <img
                    src="/Logo.svg"
                    alt="Logo"
                    className="absolute h-156 w-lg -right-64"
                />
            </div>

            <div className="flex flex-col justify-center items-center w-full md:w-2/3 min-h-screen">
                <Form {...form}>
                    <h1 className="w-auto text-start text-4xl font-bold m-4">Create an account</h1>
                    <h3 className="w-auto text-start text-1xl font-medium m-4">
                        Already have an acount? <Link to={'/login'} className="text-orange-700">Sign in</Link>
                    </h3>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-80">
                        <div className="flex flex-row gap-5">
                        <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel> First Name </FormLabel>
                                    <FormControl>
                                        <Input 
                                            placeholder="First Name"
                                            className={"border border-secondary-foreground"}
                                            {...field}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel> Last Name </FormLabel>
                                    <FormControl>
                                        <Input 
                                            placeholder="Last Name"
                                            className={"border border-secondary-foreground"}
                                            {...field}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        </div>
                        <FormField
                            control={form.control}
                            name="contactNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel> Contact Number </FormLabel>
                                    <FormControl>
                                        <Input 
                                            placeholder="Contact Number"
                                            className={"border border-secondary-foreground"}
                                            {...field}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <div className="flex flex-row gap-5">
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel> Password </FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder="Last Name"
                                                className={"border border-secondary-foreground"}
                                                {...field}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel> Confirm Password </FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder="Last Name"
                                                className={"border border-secondary-foreground"}
                                                {...field}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="flex flex-col justify-between w-full text-start">
                            <div className="flex h-full justify-center w-auto gap-2">
                                <Checkbox
                                id="showPassword"
                                className="border-secondary-foreground data-[state=checked]:bg-secondary data-[state=checked :text-secondary-foreground  data-[state=checked :border-secondary border-secondary"
                                />
                                <Label htmlFor="showPassword">Show Password</Label>
                            </div>
                            <p><strong>Your password must have:</strong></p>
                            <ul className="list-disc pl-5">
                                <li>At least 8 characters</li>
                                <li>Upper &amp; lowercase characters</li>
                                <li>At least one number and one special character</li>
                            </ul>
                        </div>
                        <Button
                        type="submit"
                        className="bg-secondary hover:bg-secondary-foreground w-full cursor-pointer"
                        >
                            Login
                        </Button>
                        <div className="flex justify-between items-center">
                            <hr className="w-1/3 border border-secondary" />
                            <h1 className="font-medium">Or</h1>
                            <hr className="w-1/3 border border-secondary" />
                        </div>
                        <Button
                        type="button"
                        className="bg-secondary hover:bg-secondary-foreground w-full cursor-pointer"
                        >
                            <svg
                                classname="mr-2 h-5 w-5"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            Sign in with Google
                        </Button>
                    </form>
                </Form>
            </div>
        </section>
    )
}
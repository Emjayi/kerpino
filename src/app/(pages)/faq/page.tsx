'use client'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Link from "next/link"
import { BackButton } from "../../ui/buttons"

export default function FAQPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <header className="mb-12 text-center">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Kerpino FAQ</h1>
                <p className="text-muted-foreground">Frequently asked questions about our products and services</p>
            </header>

            <BackButton />

            <section className="mb-16">
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger className="text-left">What is Kerpino?</AccordionTrigger>
                        <AccordionContent>
                            Kerpino is a technology company that specializes in developing innovative software solutions for
                            businesses and individuals. Our products are designed to simplify complex processes and improve
                            productivity.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-2">
                        <AccordionTrigger className="text-left">How do I create a Kerpino account?</AccordionTrigger>
                        <AccordionContent>
                            You can create a Kerpino account by visiting our website and clicking on the "Sign Up" button in the top
                            right corner. Follow the prompts to enter your information and create your account.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-3">
                        <AccordionTrigger className="text-left">What payment methods do you accept?</AccordionTrigger>
                        <AccordionContent>
                            We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers for
                            business accounts. All payments are processed securely through our payment partners.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-4">
                        <AccordionTrigger className="text-left">How can I contact customer support?</AccordionTrigger>
                        <AccordionContent>
                            Our customer support team is available 24/7. You can reach us through email at support@kerpino.com,
                            through the chat feature on our website, or by phone at +1 (800) 555-0123.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-5">
                        <AccordionTrigger className="text-left">Do you offer refunds?</AccordionTrigger>
                        <AccordionContent>
                            Yes, we offer a 30-day money-back guarantee on all our products. If you're not satisfied with your
                            purchase, please contact our customer support team within 30 days of your purchase for a full refund.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-6">
                        <AccordionTrigger className="text-left">Is my data secure with Kerpino?</AccordionTrigger>
                        <AccordionContent>
                            Yes, data security is our top priority. We use industry-standard encryption protocols to protect your
                            data, and we never share your information with third parties without your explicit consent. For more
                            details, please refer to our Privacy Policy.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-7">
                        <AccordionTrigger className="text-left">Do you offer enterprise solutions?</AccordionTrigger>
                        <AccordionContent>
                            Yes, we offer customized enterprise solutions for businesses of all sizes. Our enterprise packages include
                            dedicated support, custom integrations, and scalable infrastructure. Contact our sales team at
                            sales@kerpino.com for more information.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-8">
                        <AccordionTrigger className="text-left">How often do you release updates?</AccordionTrigger>
                        <AccordionContent>
                            We release minor updates and bug fixes on a bi-weekly basis. Major feature updates are typically released
                            quarterly. All updates are automatically applied to our cloud-based services, and notifications are sent
                            for downloadable software.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>

            <section className=" pt-10 mb-8">
                <h2 className="text-2xl font-bold mb-6">Terms of Service</h2>
                <div className="space-y-6 text-sm text-muted-foreground">
                    <div>
                        <h3 className="text-base font-medium text-foreground mb-2">1. Acceptance of Terms</h3>
                        <p>
                            By accessing or using Kerpino's services, you agree to be bound by these Terms of Service. If you do not
                            agree to these terms, please do not use our services.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-base font-medium text-foreground mb-2">2. Description of Service</h3>
                        <p>
                            Kerpino provides software solutions and services as described on our website. We reserve the right to
                            modify, suspend, or discontinue any part of our services at any time.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-base font-medium text-foreground mb-2">3. User Accounts</h3>
                        <p>
                            You are responsible for maintaining the confidentiality of your account information and for all activities
                            that occur under your account. You agree to notify Kerpino immediately of any unauthorized use of your
                            account.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-base font-medium text-foreground mb-2">4. Privacy Policy</h3>
                        <p>
                            Your use of Kerpino's services is subject to our Privacy Policy, which is incorporated into these Terms of
                            Service. Please review our Privacy Policy to understand our practices.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-base font-medium text-foreground mb-2">5. Intellectual Property</h3>
                        <p>
                            All content, features, and functionality of Kerpino's services, including but not limited to text,
                            graphics, logos, and software, are owned by Kerpino and are protected by copyright, trademark, and other
                            intellectual property laws.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-base font-medium text-foreground mb-2">6. Limitation of Liability</h3>
                        <p>
                            Kerpino shall not be liable for any indirect, incidental, special, consequential, or punitive damages
                            resulting from your use of or inability to use our services.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-base font-medium text-foreground mb-2">7. Governing Law</h3>
                        <p>
                            These Terms of Service shall be governed by and construed in accordance with the laws of the jurisdiction
                            in which Kerpino is established, without regard to its conflict of law provisions.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-base font-medium text-foreground mb-2">8. Changes to Terms</h3>
                        <p>
                            Kerpino reserves the right to modify these Terms of Service at any time. We will provide notice of
                            significant changes by posting an announcement on our website or sending you an email.
                        </p>
                    </div>
                </div>
            </section>

            <footer className="text-center text-sm text-muted-foreground pt-8 border-t">
                <p>
                    Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </p>
                <p className="mt-2">
                    For questions about these terms, please contact us at{" "}
                    <Link href="mailto:legal@kerpino.com" className="text-primary hover:underline">
                        info@kerpino.com
                    </Link>
                </p>
                <p className="mt-6">© {new Date().getFullYear()} Kerpino. All rights reserved.</p>
            </footer>
        </div>
    )
}


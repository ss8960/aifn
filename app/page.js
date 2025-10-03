import HeroSection from "@/components/hero";
import { Card, CardContent } from "@/components/ui/card";
import { featuresData, howItWorksData, statsData, testimonialsData } from "@/data/landing";
import { BarChart3, Receipt, PieChart, CreditCard, Globe, Zap } from "lucide-react";
import Button from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="mt-40">
      <HeroSection />

      <section className="py-20 bg-blue-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statsData.map((statsData, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">{statsData.value}</div>
                <div className="text-gray-600">{statsData.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-semibold text-center mb-6">Fiance In Control</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuresData.map((feature, index) => {
              const Icons = {
                barChart3: BarChart3,
                receipt: Receipt,
                pieChart: PieChart,
                creditCard: CreditCard,
                globe: Globe,
                zap: Zap,
              };
              const Icon = Icons[feature.icon];
              return (
                <Card key={index}>
                  <CardContent className="flex items-start gap-4 py-6">
                    {Icon ? <Icon className={feature.iconClassName} /> : null}
                    <div>
                      <h3 className="font-medium">{feature.title}</h3>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-blue-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-semibold text-center mb-8">Worflow</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {howItWorksData.map((step, index) => {
              const Icons = {
                barChart3: BarChart3,
                receipt: Receipt,
                pieChart: PieChart,
                creditCard: CreditCard,
                globe: Globe,
                zap: Zap,
              };
              const Icon = Icons[step.icon];
              return (
                <Card key={index}>
                  <CardContent className="flex items-start gap-4 py-6">
                    {Icon ? <Icon className={step.iconClassName} /> : null}
                    <div>
                      <h3 className="font-medium">{step.title}</h3>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-semibold text-center mb-8">Testimonials</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonialsData.map((testimonial, index) => {
              return (
                <Card key={index}>
                  <CardContent className="flex items-start gap-4 py-6">
                    <Image src={testimonial.image} alt={testimonial.name} width={50} height={50} />
                    <div className="flex flex-col gap-2">
                      <h3 className="font-medium">{testimonial.name}</h3>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                      <p className="text-sm text-gray-600">{testimonial.quote}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
      <section className="py-20 bg-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-blue-100 text-2xl font-bold text-center mb-8">
            Ready to hop onto AIFN?
          </h2>
          <p className="text-blue-100 mb-8 max-w-3xl mx-auto">
            Join AIFN today and start managing your finances with ease.
          </p>
          <Link href="/dashboard">
            <Button size="lg"
            className=" bg-white text-blue-600 hover:bg-blue-50 animate-bounce">
              Get Started
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

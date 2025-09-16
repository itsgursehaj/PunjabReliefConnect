
"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Home, ExternalLink, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function PartnersPage() {
  const router = useRouter();

  const ngos = [
    { name: "Global Sikhs", contact: "+91 91453 92453" },
    { name: "Khalsa Aid", contact: "+91 90412 23387 / +91 83601 71799", link: "https://www.khalsaaid.org/" },
    { name: "Saanjh Global Foundation", contact: "+91 98769 20114", link: "https://saanjh.org/" },
    { name: "Indian Red Cross Society", contact: "+91 1722542180 / 2780827", link: "https://indianredcross.org/" },
    { name: "Baba Deep Singh Welfare Society", contact: "+91 9417260895" },
    { name: "Guru Nanak Sewa Society, Gera Village, Mukerian", contact: "01724-185067" },
    { name: "Humanity First International", contact: "+44 (0)20 8417 0082 or info@humanityfirst.org" },
    { name: "Sarbat Da Bhala Charitable Trust", contact: "+91-98155-88000", link: "https://sarbatdabhalatrust.com/" },
  ];

  const helplines = [
      { district: "Punjab 24×7 flood relief and rescue assistance", number: "0181-2240064" },
      { district: "Amritsar", number: "0183-2229125" },
      { district: "Barnala", number: "01679-233031" },
      { district: "Bathinda", number: "0164-2862100 / 0164-2862101" },
      { district: "Faridkot", number: "01639-250338" },
      { district: "Fatehgarh Sahib", number: "01763-232838" },
      { district: "Fazilka", number: "01638-262153" },
      { district: "Ferozepur", number: "01632-245366" },
      { district: "Gurdaspur", number: "01874-266376 / 18001801852" },
      { district: "Hoshiarpur", number: "01882-220412" },
      { district: "Jalandhar", number: "0181-2224417 / 94176-57802" },
      { district: "Kapurthala", number: "01822-231990" },
      { district: "Ludhiana", number: "0161-2433100" },
      { district: "Malerkotla", number: "01675-252003" },
      { district: "Mansa", number: "01652-229082" },
      { district: "Moga", number: "01636-235206" },
      { district: "Pathankot", number: "0186-2346944 / 97791-02351" },
      { district: "Patiala", number: "0175-2350550 / 2358550" },
      { district: "Ropar", number: "01881-221157" },
      { district: "Sangrur", number: "01672-234196" },
      { district: "SAS Nagar (Mohali)", number: "0172-2219506" },
      { district: "SBS Nagar", number: "01823-220645" },
      { district: "Sri Muktsar Sahib", number: "01633-260341" },
      { district: "Tarn Taran", number: "01852-224107" },
  ];
  
  const additionalResources = [
    { name: "Support for Flood Victims in Punjab (Dasvandh Network)", link: "https://dvnetwork.org/projects/support-for-flood-victims-in-punjab" },
    { name: "Punjab Flood Relief 2025: How government, NGOs, NRIs are helping victims (SinghXpress)", link: "https://singhxpress.com/punjab-flood-relief-2025-how-government-ngos-nris-are-helping-victims/" },
    { name: "Punjab Flood Relief 2025 (Baru Sahib)", link: "https://barusahib.org/our-programs/disaster-relief/punjab-flood-relief-2025/" },
  ];

  return (
    <main className="flex flex-col items-center p-4 sm:p-8">
      <div className="w-full max-w-4xl">
        <div className="w-full bg-card p-8 sm:p-12 rounded-2xl shadow-xl border mt-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold font-headline tracking-tight bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent">
              <span>District Helplines & Local NGOs</span>
              <span className="block text-3xl sm:text-4xl text-muted-foreground mt-1">ਜ਼ਿਲ੍ਹਾ ਹੈਲਪਲਾਈਨਾਂ ਅਤੇ ਸਥਾਨਕ NGOs</span>
            </h1>
          </div>
          
          <div className="w-full flex justify-start items-center gap-4 py-8">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back / ਪਿੱਛੇ
            </Button>
             <Button asChild variant="outline">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Home / ਮੁੱਖ ਪੰਨਾ
              </Link>
            </Button>
          </div>

          <div className="space-y-8">
              <Card>
                  <CardHeader>
                      <CardTitle>District Helplines / ਜ਼ਿਲ੍ਹਾ ਹੈਲਪਲਾਈਨਾਂ</CardTitle>
                  </CardHeader>
                  <CardContent>
                       <ul className="space-y-3">
                          {helplines.map((line, index) => (
                              <li key={index} className="text-base flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-2">
                                  <span>{line.district}</span>
                                  <div className="flex items-center gap-2 mt-2 sm:mt-0">
                                      <Phone className="h-4 w-4 text-primary" />
                                      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                                        {line.number.split(' / ').map((num, i) => (
                                          <a key={i} href={`tel:${num.replace(/-/g, '')}`} className="font-semibold text-primary hover:underline">
                                            {num}
                                          </a>
                                        )).reduce((prev, curr, i) => [prev, <span key={`sep-${i}`} className="hidden sm:inline"> / </span>, curr] as any)}
                                      </div>
                                  </div>
                              </li>
                          ))}
                      </ul>
                  </CardContent>
              </Card>

               <Card>
                  <CardHeader>
                      <CardTitle>Known NGOs / ਜਾਣੀਆਂ-ਪਛਾਣੀਆਂ NGOs</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <ul className="space-y-3">
                          {ngos.map((ngo, index) => (
                              <li key={index} className="text-base flex justify-between items-center border-b pb-2">
                                  {ngo.link ? (
                                    <a href={ngo.link} target="_blank" rel="noopener noreferrer" className="flex items-center hover:underline text-primary">
                                      {ngo.name}
                                      <ExternalLink className="ml-2 h-4 w-4" />
                                    </a>
                                  ) : (
                                    <span>{ngo.name}</span>
                                  )}
                                  <span className="font-semibold text-foreground">{ngo.contact}</span>
                              </li>
                          ))}
                      </ul>
                      <ul className="space-y-3 mt-6 border-t pt-4">
                          {additionalResources.map((resource, index) => (
                              <li key={index} className="text-base border-b pb-2 last:border-b-0">
                                <a href={resource.link} target="_blank" rel="noopener noreferrer" className="flex items-center hover:underline text-primary">
                                  {resource.name}
                                  <ExternalLink className="ml-2 h-4 w-4 flex-shrink-0" />
                                </a>
                              </li>
                          ))}
                      </ul>
                  </CardContent>
              </Card>

              
              <div className="text-center text-muted-foreground pt-4">
                  <p>This is a list of known organizations. If you want to add another organization, please use the <Link href="/contact-us" className="text-primary underline hover:text-primary/80">contact form</Link>. / ਇਹ ਜਾਣੀਆਂ-ਪਛਾਣੀਆਂ ਸੰਸਥਾਵਾਂ ਦੀ ਸੂਚੀ ਹੈ। ਜੇ ਤੁਸੀਂ ਕੋਈ ਹੋਰ ਸੰਸਥਾ ਸ਼ਾਮਲ ਕਰਨਾ ਚਾਹੁੰਦੇ ਹੋ, ਤਾਂ ਕਿਰਪਾ ਕਰਕੇ <Link href="/contact-us" className="text-primary underline hover:text-primary/80">ਸੰਪਰਕ ਫਾਰਮ</Link> ਦੀ ਵਰਤੋਂ ਕਰੋ।</p>
              </div>
          </div>
        </div>
      </div>
    </main>
  );
}

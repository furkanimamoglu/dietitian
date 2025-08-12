import React, {useEffect, useState} from 'react';
import "./LandingPage.css";

const faqs = [
    {
        question: "Diyetia nedir ve nasıl çalışır?",
        answer: "Diyetia, diyetisyenler için özel olarak geliştirilmiş bir asistan yazılımıdır.",
    },
    {
        question: "Diyetia ücretsiz mi?",
        answer: "Hayır, Diyetia ücretsiz değildir. Abonelik fiyatı aylık 1000 TL'dir.",
    },
    {
        question: "Diyetia'yı nasıl satın alabilirim?",
        answer: "Satın almak için WhatsApp iletişim hattımızdan bize ulaşabilirsiniz.",
    },
    {
        question: "Verilerim güvende mi?",
        answer: "Tüm kişisel verileriniz ve sağlık bilgileriniz gizlilikle korunur ve üçüncü kişilerle paylaşılmaz.",
    },
];

function FAQSection() {
    const [openIndex, setOpenIndex] = useState(null);

    return (
        <section className="py-20 bg-gradient-to-b from-white to-orange-50" id="faq">
            <div className="max-w-3xl mx-auto px-4">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
                    Sıkça Sorulan Sorular
                </h2>
                <div className="space-y-4">
                    {faqs.map((faq, idx) => (
                        <div
                            key={idx}
                            className="border border-orange-200 rounded-xl bg-white shadow-sm"
                        >
                            <button
                                className="w-full flex justify-between items-center px-6 py-4 text-left focus:outline-none"
                                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                            >
                                <span className="text-lg font-medium text-gray-900">{faq.question}</span>
                                <span
                                    className={`transition-transform duration-200 ${openIndex === idx ? "rotate-180 text-orange-500" : "text-orange-400"}`}>
                  ▼
                </span>
                            </button>
                            {openIndex === idx && (
                                <div className="px-6 pb-4 text-gray-600 text-base">
                                    {faq.answer}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

const Play = ({className}) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z"/>
    </svg>
);

const Download = ({className}) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
    </svg>
);

const Users = ({className}) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a4 4 0 11-8 0 4 4 0 018 0z"/>
    </svg>
);

const Heart = ({className}) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
);

const Smartphone = ({className}) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M12 18h.01M8 21h8a1 1 0 001-1V4a1 1 0 00-1-1H8a1 1 0 00-1 1v16a1 1 0 001 1z"/>
    </svg>
);

const Monitor = ({className}) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
    </svg>
);

const Shield = ({className}) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
    </svg>
);

const Zap = ({className}) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
    </svg>
);

const Star = ({className}) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
);

const CheckCircle = ({className}) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
);

const ChevronLeft = ({className}) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
    </svg>
);

const ChevronRight = ({className}) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
    </svg>
);

const Instagram = ({className}) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path
            d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
);

const Twitter = ({className}) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path
            d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
    </svg>
);

const Facebook = ({className}) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path
            d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
);

const Mail = ({className}) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
    </svg>
);

const Phone = ({className}) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
    </svg>
);

const Calendar = ({className}) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
    </svg>
);

const Clock = ({className}) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
);

const BrowserMockup = ({
                           websiteUrl = "diyetia.com",
                           screenshotSrc = null,
                           title = "Web Uygulaması",
                           description = "Buraya web uygulaması ekran görüntünüzü ekleyebilirsiniz",
                           className = ""
                       }) => {
    return (
        <div className={`relative ${className}`}>
            <div className="bg-gray-200 rounded-t-2xl p-4">
                <div className="flex items-center space-x-2 mb-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="bg-white rounded-lg px-4 py-2 flex items-center space-x-2">
                    <div className="w-4 h-4 text-gray-400">🔒</div>
                    <span className="text-gray-600 text-sm">{websiteUrl}</span>
                </div>
            </div>

            <div className="bg-white border-x border-b border-gray-200 rounded-b-2xl shadow-2xl">
                <div className="h-[580px] rounded-b-2xl overflow-hidden">
                    {screenshotSrc ? (
                        <img
                            src={screenshotSrc}
                            alt={title}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                    ) : null}

                    <div
                        className="w-full h-full bg-gradient-to-b from-orange-50 to-white flex flex-col items-center justify-center"
                        style={{display: screenshotSrc ? 'none' : 'flex'}}
                    >
                        <Monitor className="w-20 h-20 text-orange-500 mb-4"/>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                        <p className="text-gray-600 text-center px-8">
                            {description}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const LandingPage = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const images = [
        {
            src: "/assets/mobil.jpeg",
            alt: "Uygulama Ana Ekran"
        },
    ];

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        const autoAdvanceImages = setInterval(() => {
            setCurrentImageIndex(prev => (prev + 1) % images.length);
        }, 3000);

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearInterval(autoAdvanceImages);
        };
    }, [images.length]);

    return (
        <div className="min-h-screen bg-white relative">
            <style jsx>{`
        @keyframes pulse-orange {
          0%, 100% { 
            box-shadow: 0 0 0 0 rgba(251, 146, 60, 0.7);
            transform: scale(1);
          }
          50% { 
            box-shadow: 0 0 0 10px rgba(251, 146, 60, 0);
            transform: scale(1.05);
          }
        }

        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(251, 146, 60, 0.3); }
          50% { box-shadow: 0 0 30px rgba(251, 146, 60, 0.6), 0 0 40px rgba(251, 146, 60, 0.3); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes border-pulse {
          0%, 100% { 
            border-color: rgba(251, 146, 60, 0.3);
            box-shadow: 0 0 0 0 rgba(251, 146, 60, 0.4);
          }
          50% { 
            border-color: rgba(251, 146, 60, 1);
            box-shadow: 0 0 0 8px rgba(251, 146, 60, 0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(20px);
          }
        }

        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .pulse-box {
          animation: pulse-orange 2s infinite;
        }

        .glow-box {
          animation: glow 3s ease-in-out infinite;
        }

        .float-animation {
          animation: float 3s ease-in-out infinite;
        }

        .pulse-border {
          animation: border-pulse 2s ease-in-out infinite;
        }

        .gradient-border {
          border: 1px solid transparent;
          background: linear-gradient(white, white) padding-box,
                      linear-gradient(45deg, #f97316, #fb923c) border-box;
        }

        .slide-in-left {
          animation: slideInLeft 0.8s ease-out;
        }

        .slide-in-right {
          animation: slideInRight 0.8s ease-out;
        }

        .slide-in-up {
          animation: slideInUp 0.8s ease-out;
        }

        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }

        .animate-blob {
          animation: blob 8s infinite;
        }
      `}</style>

            <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
                isScrolled ? 'bg-white border-b border-gray-200' : 'bg-white'
            }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-2">
                            <div
                                className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center pulse-box">
                                <Heart className="w-5 h-5 text-white"/>
                            </div>
                            <span className="text-xl font-bold text-gray-900">Diyetia</span>
                        </div>

                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#features"
                               className="text-gray-600 hover:text-orange-500 transition-colors">Özellikler</a>
                            <a href="#pricing"
                               className="text-gray-600 hover:text-orange-500 transition-colors">Fiyatlar</a>
                            <a href="#download"
                               className="text-gray-600 hover:text-orange-500 transition-colors">İndir</a>
                            <a
                                href="https://wa.me/905075280653"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-orange-400 hover:bg-orange-500 text-white px-6 py-2 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                            >
                                İletişime Geç
                            </a>
                            <a
                                href="/girisyap"
                                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                            >
                                Başla
                            </a>
                        </div>
                    </div>
                </div>
            </nav>

            <section className="pt-24 pb-0 bg-gradient-to-b from-orange-600 to-orange-500">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8">
                            <h1 className="text-6xl md:text-7xl font-bold text-gray-900 leading-tight">
                                Sağlıklı yaşam
                                <br/>
                                <span className="bg-gradient-to-r from-white to-white bg-clip-text text-transparent">
                  artık kolay
                </span>
                            </h1>
                            <p className="text-xl md:text-2xl text-white leading-relaxed">
                                Uzman diyetisyenlerle buluşun. Kişiselleştirilmiş beslenme planlarınızı takip edin.
                                Hedeflerinize teknoloji destekli çözümlerle ulaşın.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 ">
                                <a
                                    href="https://play.google.com/store/apps/details?id=com.diyetia"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="glow-box bg-white hover:bg-gray text-gray px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2  pulse-box"
                                >
                                    <Download className="w-5 h-5 "/>
                                    <span>Google Play'den İndir</span>
                                </a>
                                <button
                                    className="flex items-center justify-center space-x-2 t text-gray-900 transition-colors bg-orange-300 px-8 py-4 rounded-full text-lg font-semibold transform hover:scale-105">
                                    <Play className="w-5 h-5"/>
                                    <span className="text-lg font-semibold">Demo İzle</span>
                                </button>
                            </div>

                            <div className="flex items-center space-x-8 text-sm text-gray-500">
                                <div className="flex items-center space-x-1 text-white">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4  text-white-200"/>
                                    ))}
                                    <span className="ml-2">4.9/5 (10,000+ değerlendirme)</span>
                                </div>
                            </div>
                        </div>

                        <div className="relative w-full flex justify-end pr-8">
                            <div className="flex items-center w-full max-w-800 h-full max-h-md">
                                <img
                                    src="./Component 1.png"
                                    alt="Uygulama Ekranı"
                                    className="w-stretch h-stretch object-cover rounded-3xl"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="pt-0 pb-20 bg-gradient-to-b from-gray-50 to-white">
                <img alt="header background" loading="lazy"
                     src="https://dietitian-project.s3.amazonaws.com/media/general_settings/header-background-2.png"
                     className="bg-gradient-to-b from-orange-500 to-orange-600"></img>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <BrowserMockup
                        screenshotSrc="/web.jpeg"
                        websiteUrl="diyetia.com"
                        title="Diyetia Web"
                        description="Web uygulaması ana sayfası"
                    />
                </div>
            </section>

            <section id="features" className="py-20 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Mükemmel tasarım.
                            <br/>
                            <span className="text-orange-500">Güçlü özellikler.</span>
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Her detayı düşünülmüş, kullanıcı dostu arayüz ile sağlıklı yaşam hedeflerinize ulaşın.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Card 1 */}
                        <div
                            className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 border border-gray-100 transform hover:scale-105 slide-in-left">
                            <div
                                className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mb-6 pulse-box">
                                <Calendar className="w-8 h-8 text-white"/>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Randevu Yönetimi</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Danışanlarınızla kolayca randevu oluşturun, yönetin ve takvim entegrasyonu ile takip
                                edin.
                            </p>
                        </div>

                        {/* Card 2 */}
                        <div
                            className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 border border-gray-100 transform hover:scale-105 slide-in-right">
                            <div
                                className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mb-6 glow-box">
                                <Users className="w-8 h-8 text-white"/>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Danışan Yönetimi</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Tüm danışanlarınızı tek panelden yönetin, geçmişlerini ve gelişimlerini görüntüleyin.
                            </p>
                        </div>

                        {/* Card 3 */}
                        <div
                            className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 border border-gray-100 transform hover:scale-105 slide-in-left">
                            <div
                                className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mb-6 pulse-box">
                                <Monitor className="w-8 h-8 text-white"/>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Beslenme Plan Yönetimi</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Kişiye özel beslenme planları oluşturun, düzenleyin ve danışanlarınıza kolayca iletin.
                            </p>
                        </div>

                        {/* Card 4 */}
                        <div
                            className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 border border-gray-100 transform hover:scale-105 slide-in-right">
                            <div
                                className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mb-6 pulse-box">
                                <CheckCircle className="w-8 h-8 text-white"/>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Beslenme Plan Takibi</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Danışanlarınızın planlara uyumunu ve günlük ilerlemelerini anlık olarak takip edin.
                            </p>
                        </div>

                        {/* Card 5 */}
                        <div
                            className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 border border-gray-100 transform hover:scale-105 slide-in-left">
                            <div
                                className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mb-6 glow-box">
                                <Zap className="w-8 h-8 text-white"/>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Danışan Su Takibi</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Danışanlarınızın günlük su tüketimini izleyin ve hedeflerine ulaşmalarını sağlayın.
                            </p>
                        </div>

                        {/* Card 6 */}
                        <div
                            className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 border border-gray-100 transform hover:scale-105 slide-in-right">
                            <div
                                className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mb-6 pulse-box">
                                <Zap className="w-8 h-8 text-white"/>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Egzersiz Taslak Yönetimi</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Egzersiz programlarını kolayca oluşturun, kaydedin ve danışanlarınıza atayın.
                            </p>
                        </div>

                        {/* Card 7 */}
                        <div
                            className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 border border-gray-100 transform hover:scale-105 slide-in-left">
                            <div
                                className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mb-6 pulse-box">
                                <Clock className="w-8 h-8 text-white"/>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Egzersiz Takibi</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Danışanlarınızın egzersizlerini ve ilerlemelerini günlük olarak takip edin.
                            </p>
                        </div>

                        {/* Card 8 */}
                        <div
                            className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 border border-gray-100 transform hover:scale-105 slide-in-right">
                            <div
                                className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mb-6 glow-box">
                                <Star className="w-8 h-8 text-white"/>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Tarif Yönetimi ve Tarif Paylaşımı</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Sağlıklı tarifler oluşturun, danışanlarınızla paylaşın ve favori tariflerinizi yönetin.
                            </p>
                        </div>

                        {/* Card 9 */}
                        <div
                            className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 border border-gray-100 transform hover:scale-105 slide-in-left">
                            <div
                                className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mb-6 pulse-box">
                                <Download className="w-8 h-8 text-white"/>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Finans, Fatura ve Paketler</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Gelirlerinizi, fatura işlemlerinizi ve danışan paketlerinizi kolayca yönetin.
                            </p>
                        </div>

                        {/* Card 10 */}
                        <div
                            className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 border border-gray-100 transform hover:scale-105 slide-in-right">
                            <div
                                className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mb-6 pulse-box">
                                <Mail className="w-8 h-8 text-white"/>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Bildirim ve SMSlerle
                                Hatırlatmalar</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Otomatik bildirim ve SMS ile danışanlarınıza randevu ve plan hatırlatmaları gönderin.
                            </p>
                        </div>

                        {/* Card 11 */}
                        <div
                            className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 border border-gray-100 transform hover:scale-105 slide-in-left">
                            <div
                                className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mb-6 glow-box">
                                <Smartphone className="w-8 h-8 text-white"/>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Mobil Uygulama</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Tüm özelliklere mobil uygulama üzerinden de erişin, her an her yerde yönetin.
                            </p>
                        </div>

                        {/* Card 12 */}
                        <div
                            className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 border border-gray-100 transform hover:scale-105 slide-in-left">
                            <div
                                className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mb-6 glow-box">
                                <Mail className="w-8 h-8 text-white"/>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Anlık Mesajlaşma</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Danışanlarınızla uygulama üzerinden anlık olarak güvenli şekilde mesajlaşın.
                            </p>
                        </div>
                    </div>
                </div>
            </section>


            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div className="space-y-2">
                            <div className="text-4xl md:text-5xl font-bold text-orange-500">50K+</div>
                            <div className="text-gray-600">Aktif Kullanıcı</div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-4xl md:text-5xl font-bold text-orange-500">1,200+</div>
                            <div className="text-gray-600">Uzman Diyetisyen</div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-4xl md:text-5xl font-bold text-orange-500">98%</div>
                            <div className="text-gray-600">Memnuniyet Oranı</div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-4xl md:text-5xl font-bold text-orange-500">4.9</div>
                            <div className="text-gray-600">App Store Puanı</div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Size uygun <span className="text-orange-500">planı</span> seçin
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            İhtiyaçlarınıza göre tasarlanmış esnek fiyatlandırma seçenekleri
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div
                            className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 border border-gray-200">
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Öğrenci</h3>
                                <div className="mb-4">
                                    <span className="text-4xl font-bold text-gray-900">₺-</span>
                                    <span className="text-gray-600">/ay</span>
                                </div>
                                <p className="text-gray-600">Öğrenciler için özel fiyat</p>
                            </div>

                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center">
                                    <CheckCircle className="w-5 h-5 text-orange-500 mr-3"/>
                                    <span className="text-gray-700">Temel beslenme takibi</span>
                                </li>
                                <li className="flex items-center">
                                    <CheckCircle className="w-5 h-5 text-orange-500 mr-3"/>
                                    <span className="text-gray-700">Kalori hesaplayıcı</span>
                                </li>
                                <li className="flex items-center">
                                    <CheckCircle className="w-5 h-5 text-orange-500 mr-3"/>
                                    <span className="text-gray-700">Su tüketimi takibi</span>
                                </li>
                                <li className="flex items-center">
                                    <CheckCircle className="w-5 h-5 text-orange-500 mr-3"/>
                                    <span className="text-gray-700">Haftalık raporlar</span>
                                </li>
                                <li className="flex items-center">
                                    <CheckCircle className="w-5 h-5 text-orange-500 mr-3"/>
                                    <span className="text-gray-700">E-posta desteği</span>
                                </li>
                            </ul>

                            <button
                                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-full font-semibold transition-colors">
                                Başla
                            </button>
                        </div>

                        <div
                            className="bg-white rounded-3xl p-8 shadow-2xl border-2 border-orange-500 transform scale-105 relative">
                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span
                    className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
                  En Popüler
                </span>
                            </div>

                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Premium</h3>
                                <div className="mb-4">
                                    <span className="text-4xl font-bold text-orange-600">₺-</span>
                                    <span className="text-gray-600">/ay</span>
                                </div>
                                <p className="text-gray-600">Bireysel kullanıcılar için</p>
                            </div>

                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center">
                                    <CheckCircle className="w-5 h-5 text-orange-500 mr-3"/>
                                    <span className="text-gray-700">Öğrenci planının tüm özellikleri</span>
                                </li>
                                <li className="flex items-center">
                                    <CheckCircle className="w-5 h-5 text-orange-500 mr-3"/>
                                    <span className="text-gray-700">Uzman diyetisyen danışmanlığı</span>
                                </li>
                                <li className="flex items-center">
                                    <CheckCircle className="w-5 h-5 text-orange-500 mr-3"/>
                                    <span className="text-gray-700">Kişiselleştirilmiş diyet planı</span>
                                </li>
                                <li className="flex items-center">
                                    <CheckCircle className="w-5 h-5 text-orange-500 mr-3"/>
                                    <span className="text-gray-700">Haftalık görüşmeler</span>
                                </li>
                                <li className="flex items-center">
                                    <CheckCircle className="w-5 h-5 text-orange-500 mr-3"/>
                                    <span className="text-gray-700">7/24 chat desteği</span>
                                </li>
                            </ul>

                            <button
                                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 rounded-full font-semibold transition-all duration-300 pulse-box">
                                Başla
                            </button>
                        </div>

                        <div
                            className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 border border-gray-200">
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Kurumsal</h3>
                                <div className="mb-4">
                                    <span className="text-4xl font-bold text-gray-900">₺-</span>
                                    <span className="text-gray-600">/ay</span>
                                </div>
                                <p className="text-gray-600">Şirketler için özel çözüm</p>
                            </div>

                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center">
                                    <CheckCircle className="w-5 h-5 text-orange-500 mr-3"/>
                                    <span className="text-gray-700">Premium planının tüm özellikleri</span>
                                </li>
                                <li className="flex items-center">
                                    <CheckCircle className="w-5 h-5 text-orange-500 mr-3"/>
                                    <span className="text-gray-700">50 kullanıcıya kadar</span>
                                </li>
                                <li className="flex items-center">
                                    <CheckCircle className="w-5 h-5 text-orange-500 mr-3"/>
                                    <span className="text-gray-700">Yönetici paneli</span>
                                </li>
                                <li className="flex items-center">
                                    <CheckCircle className="w-5 h-5 text-orange-500 mr-3"/>
                                    <span className="text-gray-700">Toplu raporlama</span>
                                </li>
                                <li className="flex items-center">
                                    <CheckCircle className="w-5 h-5 text-orange-500 mr-3"/>
                                    <span className="text-gray-700">Öncelikli destek</span>
                                </li>
                            </ul>

                            <button
                                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-full font-semibold transition-colors">
                                İletişime Geç
                            </button>
                        </div>
                    </div>

                    <div className="text-center mt-12">
                        <p className="text-gray-600 mb-4">
                            Tüm planlar 14 günlük ücretsiz deneme ile birlikte gelir
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
                            <div className="flex items-center">
                                <CheckCircle className="w-4 h-4 text-orange-500 mr-2"/>
                                İstediğiniz zaman iptal
                            </div>
                            <div className="flex items-center">
                                <CheckCircle className="w-4 h-4 text-orange-500 mr-2"/>
                                Kredi kartı gerekmez
                            </div>
                            <div className="flex items-center">
                                <CheckCircle className="w-4 h-4 text-orange-500 mr-2"/>
                                30 gün para iade garantisi
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="faq">
                <FAQSection/>
            </section>

            <section className="bg-gradient-to-b from-orange-50 to-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Bizimle <span className="text-orange-500">iletişime</span> geçin
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                            Sorularınız için buradayız. Size en uygun çözümü birlikte bulalım.
                        </p>
                        <div
                            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 px-8 rounded-full inline-block font-semibold text-lg animate-pulse">
                            Ücretsiz Demo Sunum Talep Edin
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 items-center py-8">
                        <div className="space-y-8">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                    <Mail className="w-6 h-6 text-orange-500"/>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">E-posta</h3>
                                    <a href="mailto:info@diyetia.com"
                                       className="text-gray-600 hover:text-orange-500 transition-colors">
                                        info@diyetia.com
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                    <Phone className="w-6 h-6 text-orange-500"/>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Telefon</h3>
                                    <a href="tel:+902121234567"
                                       className="text-gray-600 hover:text-orange-500 transition-colors">
                                        +90 (212) 123 45 67
                                    </a>
                                </div>
                            </div>

                            <div className="pt-8">
                                <h3 className="text-lg font-semibold text-gray-900 mb-6">Sosyal Medya</h3>
                                <div className="flex space-x-4">
                                    <a href="https://www.instagram.com/diyetia.app/"
                                       className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white hover:bg-orange-600 transition-colors transform hover:scale-110">
                                        <Instagram className="w-6 h-6"/>
                                    </a>
                                    <a href="https://www.linkedin.com/company/diyetia/" target="_blank"
                                       rel="noopener noreferrer"
                                       className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white hover:bg-orange-600 transition-colors transform hover:scale-110">
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                            <path
                                                d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-9h3v9zm-1.5-10.28c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.79 1.75 1.75-.78 1.75-1.75 1.75zm13.5 10.28h-3v-4.5c0-1.08-.02-2.47-1.5-2.47-1.5 0-1.73 1.17-1.73 2.39v4.58h-3v-9h2.89v1.23h.04c.4-.75 1.37-1.54 2.82-1.54 3.01 0 3.57 1.98 3.57 4.56v4.75z"/>
                                        </svg>
                                    </a>
                                    <a href="#"
                                       className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white hover:bg-orange-600 transition-colors transform hover:scale-110">
                                        <Twitter className="w-6 h-6"/>
                                    </a>
                                    <a href="#"
                                       className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white hover:bg-orange-600 transition-colors transform hover:scale-110">
                                        <Facebook className="w-6 h-6"/>
                                    </a>
                                    <a href="#"
                                       className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white hover:bg-orange-600 transition-colors transform hover:scale-110">
                                        <Mail className="w-6 h-6"/>
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="pb-20 bg-orange-200 rounded-3xl p-8">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Mesaj Gönder</h3>
                            <p className="text-sm text-orange-600 font-semibold mb-6">Ücretsiz Demo Sunum için Formu
                                Doldurun</p>
                            <form className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Ad Soyad
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                                            placeholder="Adınızı girin"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            E-posta
                                        </label>
                                        <input
                                            type="email"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                                            placeholder="E-posta adresinizi girin"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Konu
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                                        placeholder="Mesaj konusu"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Mesaj
                                    </label>
                                    <textarea
                                        rows="4"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                                        placeholder="Mesajınızı yazın..."
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                                >
                                    Mesaj Gönder
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            <section id="download" className="py-20 bg-gradient-to-r from-orange-500 to-orange-600">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Sağlıklı yaşam yolculuğunuz bugün başlıyor.
                    </h2>
                    <p className="text-xl text-orange-100 mb-8">
                        Binlerce kişi hedeflerine ulaştı. Sıra sizde.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        {/*<button className="bg-white text-orange-500 hover:bg-gray-50 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 pulse-box">*/}
                        {/*    App Store'dan İndir*/}
                        {/*</button>*/}
                        <a
                            href="https://play.google.com/store/apps/details?id=com.diyetia"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-orange-500 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300"
                        >
                            Google Play'den İndir
                        </a>
                    </div>
                </div>
            </section>

            <footer className="bg-gray-900 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center">
                                    <Heart className="w-5 h-5 text-white"/>
                                </div>
                                <span className="text-xl font-bold">Diyetia</span>
                            </div>
                            <p className="text-gray-400">
                                Sağlıklı yaşamın dijital adresi. Uzman diyetisyenlerle teknoloji destekli beslenme
                                çözümleri.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Ürün</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white transition-colors">Özellikler</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Fiyatlar</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Güvenlik</a></li>
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Şirket</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white transition-colors">Hakkımızda</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Kariyer</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">İletişim</a></li>
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Destek</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white transition-colors">Yardım Merkezi</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Diyetisyen Ol</a></li>
                                <li><a href="/privacy" className="hover:text-white transition-colors">Gizlilik</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
                        <p>© 2025 Diyetia. Tüm hakları saklıdır.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;


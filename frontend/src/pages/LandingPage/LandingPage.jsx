import React, { useState, useEffect } from "react";
import "./LandingPage.css";

export default function LandingPage() {
    // Mobil menü için state
    const [menuOpen, setMenuOpen] = useState(false);

    // Navbar scroll işlemi için
    const [scrolled, setScrolled] = useState(false);

    // Scroll işlemini takip et
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    // FAQ için accordion işlevi
    const [activeAccordion, setActiveAccordion] = useState(null);

    const toggleAccordion = (index) => {
        setActiveAccordion(activeAccordion === index ? null : index);
    };

    // Sık Sorulan Sorular verisi
    const faqData = [
        {
            question: "Diyetia ile danışanlarımı nasıl yönetebilirim?",
            answer: "Diyetia platformu sayesinde tüm danışanlarınızın bilgilerini tek bir yerden yönetebilir, beslenme programları oluşturabilir, ölçüm takibi yapabilir ve otomatik hatırlatmalar gönderebilirsiniz."
        },
        {
            question: "Diyetia'nın ödeme planları nasıl işliyor?",
            answer: "Diyetia'da aylık ve yıllık abonelik seçenekleri bulunmaktadır. Yıllık abonelik seçeneğinde %20 indirim sağlanmaktadır. İstediğiniz zaman aboneliğinizi yükseltebilir veya iptal edebilirsiniz."
        },
        {
            question: "Diyetia'ya kaydolmak için ne gerekiyor?",
            answer: "Diyetia'ya kaydolmak için bir e-posta adresiniz ve profesyonel diyetisyen bilgileriniz yeterli. Hemen kaydolabilir ve 14 günlük ücretsiz deneme süresinden faydalanabilirsiniz."
        },
        {
            question: "Sisteme danışanların bilgileri nasıl girilir?",
            answer: "Kullanımı kolay arayüzümüz ile danışanlarınızın temel bilgilerini, ölçümlerini, beslenme alışkanlıklarını ve hedeflerini hızlıca kaydedebilirsiniz. Ayrıca toplu danışan ekleme özelliğimiz ile Excel dosyasından kolay içe aktarım yapabilirsiniz."
        },
        {
            question: "Özel beslenme programları oluşturabilir miyim?",
            answer: "Evet, Diyetia'nın gelişmiş diyet planlama araçları ile danışanlarınıza özel beslenme programları oluşturabilir, şablonlar hazırlayabilir ve bunları kolayca danışanlarınızla paylaşabilirsiniz."
        }
    ];

    // Özellikler verisi
    const featuresData = [
        {
            title: "Danışan Yönetimi",
            description: "Tüm danışanlarınızın bilgilerini güvenle saklayın, kolayca erişin ve yönetin.",
            icon: "👥"
        },
        {
            title: "Beslenme Programı Oluşturma",
            description: "Sürükle-bırak arayüzüyle kişiye özel beslenme programları hazırlayın.",
            icon: "🍎"
        },
        {
            title: "Ölçüm Takibi",
            description: "Danışanlarınızın ilerlemesini grafik ve tablolarla takip edin.",
            icon: "📊"
        },
        {
            title: "Otomatik Hatırlatmalar",
            description: "Randevu ve takip hatırlatmalarını otomatik gönderin, hiçbir detayı kaçırmayın.",
            icon: "🔔"
        },
        {
            title: "Online Randevu Sistemi",
            description: "Danışanlarınız kolayca randevu alabilsin, takvim entegrasyonu ile programınızı yönetin.",
            icon: "📅"
        },
        {
            title: "Ödeme Takibi",
            description: "Ödemeleri takip edin, fatura oluşturun ve finansal raporlar alın.",
            icon: "💰"
        }
    ];

    // Fiyatlandırma verisi
    const pricingData = [
        {
            title: "Başlangıç",
            price: "300₺",
            period: "aylık",
            features: [
                "10 danışan kapasitesi",
                "Temel danışan yönetimi",
                "Basit beslenme programları",
                "Email desteği"
            ],
            highlighted: false
        },
        {
            title: "Profesyonel",
            price: "500₺",
            period: "aylık",
            features: [
                "50 danışan kapasitesi",
                "Gelişmiş danışan yönetimi",
                "Özelleştirilebilir beslenme programları",
                "Ölçüm takibi ve grafikler",
                "Online randevu sistemi",
                "Öncelikli destek",
            ],
            highlighted: true
        },
        {
            title: "Premium",
            price: "800₺",
            period: "aylık",
            features: [
                "Sınırsız danışan",
                "Tüm özellikler",
                "Özel beslenme programı şablonları",
                "WhatsApp entegrasyonu",
                "Özel marka oluşturma",
                "7/24 öncelikli destek",
            ],
            highlighted: false
        }
    ];

    return (
        <>
            {/* Navigation */}
            <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
                <div className="container">
                    <div className="logo">
                        <img src="https://placehold.co/200x60?text=Diyetia" alt="Diyetia Logo" />
                    </div>
                    <div className={`nav-links ${menuOpen ? "active" : ""}`}>
                        <a href="#home" onClick={() => setMenuOpen(false)}>Ana Sayfa</a>
                        <a href="#features" onClick={() => setMenuOpen(false)}>Özellikler</a>
                        <a href="#pricing" onClick={() => setMenuOpen(false)}>Fiyatlandırma</a>
                        <a href="#faq" onClick={() => setMenuOpen(false)}>SSS</a>
                        <a href="#contact" onClick={() => setMenuOpen(false)}>İletişim</a>
                    </div>
                    <div className="auth-buttons">
                        <button className="btn btn-outline">Giriş Yap</button>
                        <button className="btn btn-primary">Ücretsiz Dene</button>
                    </div>
                    <div className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section id="home" className="hero-section">
                <div className="container">
                    <div className="hero-content">
                        <h1>Diyetisyenler İçin Modern Danışan Yönetim Sistemi</h1>
                        <p>
                            Diyetia ile danışanlarınızı profesyonelce yönetin, beslenme programları oluşturun
                            ve işinizi büyütün. Diyetisyenler tarafından diyetisyenler için tasarlandı.
                        </p>
                        <div className="hero-buttons">
                            <button className="btn btn-primary btn-lg">Ücretsiz Denemeyi Başlat</button>
                            <button className="btn btn-outline btn-lg">Demo İzle</button>
                        </div>
                        <div className="hero-stats">
                            <div className="stat-item">
                                <span className="stat-number">500+</span>
                                <span className="stat-text">Aktif Diyetisyen</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">15.000+</span>
                                <span className="stat-text">Yönetilen Danışan</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">98%</span>
                                <span className="stat-text">Müşteri Memnuniyeti</span>
                            </div>
                        </div>
                    </div>
                    <div className="hero-image">
                        <img src="https://placehold.co/600x400?text=Diyetia+Dashboard" alt="Diyetia Dashboard" />
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="features-section">
                <div className="container">
                    <div className="section-header">
                        <h2>Diyetia'nın Özellikleri</h2>
                        <p>Pratiğinizi geliştirmek ve danışanlarınıza en iyi hizmeti sunmak için ihtiyacınız olan her şey</p>
                    </div>

                    <div className="features-grid">
                        {featuresData.map((feature, index) => (
                            <div className="feature-card" key={index}>
                                <div className="feature-icon">{feature.icon}</div>
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </div>
                        ))}
                    </div>

                    <div className="feature-showcase">
                        <div className="showcase-content">
                            <h3>Sezgisel ve Kolay Kullanım</h3>
                            <p>Diyetia'nın kullanıcı dostu arayüzü sayesinde hiçbir teknik bilgi gerektirmeden, dakikalar içinde danışanlarınızı yönetmeye başlayabilirsiniz.</p>
                            <ul>
                                <li>Gelişmiş arama ve filtreleme seçenekleri</li>
                                <li>Sürükle-bırak beslenme programı oluşturma</li>
                                <li>Otomatik rapor oluşturma ve paylaşma</li>
                                <li>Mobil uyumlu tasarım</li>
                            </ul>
                            <button className="btn btn-secondary">Daha Fazla Özellik</button>
                        </div>
                        <div className="showcase-image">
                            <img src="https://placehold.co/500x300?text=Kullanici+Arayuzu" alt="Diyetia Kullanıcı Arayüzü" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="testimonials-section">
                <div className="container">
                    <div className="section-header">
                        <h2>Diyetisyenler Diyetia Hakkında Ne Diyor?</h2>
                        <p>Diyetia'yı kullanan meslektaşlarınızın deneyimleri</p>
                    </div>

                    <div className="testimonials">
                        <div className="testimonial-card">
                            <div className="quote">"Diyetia sayesinde danışanlarımı takip etmek çok kolaylaştı. Artık tüm zamanımı danışanlarıma odaklanarak geçirebiliyorum."</div>
                            <div className="testimonial-author">
                                <img src="https://placehold.co/60x60?text=A" alt="Ayşe Yılmaz" />
                                <div>
                                    <h4>Ayşe Yılmaz</h4>
                                    <p>Klinik Diyetisyen, İstanbul</p>
                                </div>
                            </div>
                        </div>

                        <div className="testimonial-card">
                            <div className="quote">"Beslenme programı oluşturma aracı gerçekten muhteşem. Danışanlarım için programları çok hızlı hazırlayabiliyorum ve geri bildirimler harika."</div>
                            <div className="testimonial-author">
                                <img src="https://placehold.co/60x60?text=M" alt="Mehmet Kaya" />
                                <div>
                                    <h4>Mehmet Kaya</h4>
                                    <p>Sporcu Beslenmesi Uzmanı, Ankara</p>
                                </div>
                            </div>
                        </div>

                        <div className="testimonial-card">
                            <div className="quote">"Randevu sistemi ve otomatik hatırlatmalar sayesinde danışan katılım oranım %30 arttı. Diyetia'yı tüm meslektaşlarıma öneriyorum."</div>
                            <div className="testimonial-author">
                                <img src="https://placehold.co/60x60?text=Z" alt="Zeynep Demir" />
                                <div>
                                    <h4>Zeynep Demir</h4>
                                    <p>Fonksiyonel Tıp Diyetisyeni, İzmir</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="pricing-section">
                <div className="container">
                    <div className="section-header">
                        <h2>Basit ve Şeffaf Fiyatlandırma</h2>
                        <p>İhtiyaçlarınıza ve bütçenize uygun planlar</p>
                        <div className="pricing-toggle">
                            <span>Aylık</span>
                            <label className="switch">
                                <input type="checkbox" />
                                <span className="slider round"></span>
                            </label>
                            <span>Yıllık <span className="discount">%20 İndirim</span></span>
                        </div>
                    </div>

                    <div className="pricing-cards">
                        {pricingData.map((plan, index) => (
                            <div className={`pricing-card ${plan.highlighted ? "highlighted" : ""}`} key={index}>
                                {plan.highlighted && <div className="most-popular">En Popüler</div>}
                                <h3>{plan.title}</h3>
                                <div className="price">
                                    <span className="amount">{plan.price}</span>
                                    <span className="period">/{plan.period}</span>
                                </div>
                                <ul className="features-list">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx}>{feature}</li>
                                    ))}
                                </ul>
                                <button className={`btn ${plan.highlighted ? "btn-primary" : "btn-outline"} btn-block`}>
                                    {plan.highlighted ? "Hemen Başla" : "Seç"}
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="enterprise-plan">
                        <div className="enterprise-content">
                            <h3>Kurumsal Çözümler</h3>
                            <p>Büyük diyetisyen grupları, hastaneler ve sağlık kuruluşları için özel çözümler sunuyoruz. Size özel fiyatlandırma ve özelleştirme seçenekleri için bizimle iletişime geçin.</p>
                        </div>
                        <button className="btn btn-outline">İletişime Geç</button>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="faq-section">
                <div className="container">
                    <div className="section-header">
                        <h2>Sıkça Sorulan Sorular</h2>
                        <p>Diyetia hakkında en çok merak edilenler</p>
                    </div>

                    <div className="accordion">
                        {faqData.map((faq, index) => (
                            <div className={`accordion-item ${activeAccordion === index ? "active" : ""}`} key={index}>
                                <div className="accordion-header" onClick={() => toggleAccordion(index)}>
                                    <h3>{faq.question}</h3>
                                    <span className="accordion-icon">
                    {activeAccordion === index ? "−" : "+"}
                  </span>
                                </div>
                                <div className="accordion-body">
                                    <p>{faq.answer}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="more-questions">
                        <h3>Başka sorularınız mı var?</h3>
                        <p>Ekibimiz tüm sorularınıza yanıt vermek için hazır.</p>
                        <button className="btn btn-secondary">Destek Merkezi</button>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-content">
                        <h2>Diyetisyenlik Pratiğinizi Bugün Dönüştürün</h2>
                        <p>14 gün ücretsiz deneme. Kredi kartı gerekmez. İstediğiniz zaman iptal edebilirsiniz.</p>
                        <div className="cta-buttons">
                            <button className="btn btn-primary btn-lg">Ücretsiz Denemeyi Başlat</button>
                            <button className="btn btn-outline btn-lg">Demo Talep Et</button>
                        </div>
                    </div>
                    <img src="https://placehold.co/500x300?text=Diyetia+App" alt="Diyetia Uygulama Görseli" />
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="contact-section">
                <div className="container">
                    <div className="section-header">
                        <h2>İletişim</h2>
                        <p>Sorularınız mı var? Bize ulaşın!</p>
                    </div>

                    <div className="contact-container">
                        <div className="contact-info">
                            <div className="contact-item">
                                <div className="icon">📧</div>
                                <h3>E-posta</h3>
                                <p>info@diyetia.com</p>
                            </div>
                            <div className="contact-item">
                                <div className="icon">📞</div>
                                <h3>Telefon</h3>
                                <p>+90 212 123 45 67</p>
                            </div>
                            <div className="contact-item">
                                <div className="icon">📍</div>
                                <h3>Adres</h3>
                                <p>Maslak, 34485 Sarıyer/İstanbul</p>
                            </div>
                            <div className="social-links">
                                <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
                                <a href="#" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
                                <a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
                                <a href="#" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
                            </div>
                        </div>

                        <div className="contact-form">
                            <form>
                                <div className="form-group">
                                    <label htmlFor="name">İsim</label>
                                    <input type="text" id="name" name="name" placeholder="İsminiz" required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="email">E-posta</label>
                                    <input type="email" id="email" name="email" placeholder="E-posta adresiniz" required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="subject">Konu</label>
                                    <input type="text" id="subject" name="subject" placeholder="Konu" required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="message">Mesaj</label>
                                    <textarea id="message" name="message" placeholder="Mesajınız" rows="5" required></textarea>
                                </div>
                                <button type="submit" className="btn btn-primary btn-block">Gönder</button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <div className="footer-bottom">
                        <p>&copy; {new Date().getFullYear()} Diyetia. Tüm hakları saklıdır.</p>
                    </div>
                </div>
            </footer>
        </>
    );
}
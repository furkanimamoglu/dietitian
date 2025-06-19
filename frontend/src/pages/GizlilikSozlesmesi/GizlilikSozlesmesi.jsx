import React from 'react';
import './GizlilikSozlesmesi.css';
import {
    Box,
    Container,
    Typography,
    Paper,
    Card,
    CardContent,
    useTheme,
    useMediaQuery
} from "@mui/material";
import DefaultWithFooter from "../../Components/Layouts/DefaultWithFooter.jsx";

function GizlilikSozlesmesi() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <DefaultWithFooter>
            <Box className="gizlilik-page" sx={{
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                position: 'relative'
            }}>
                <Box className="header-banner"
                    sx={{
                        background: 'linear-gradient(135deg, #ff7355 0%, #fc9e21 100%)',
                        borderBottomLeftRadius: '15%',
                        borderBottomRightRadius: '15%',
                        boxShadow: '0 4px 20px rgba(252, 158, 33, 0.3)',
                        height: '25vh',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: '-10px',
                            left: 0,
                            width: '100%',
                            height: '50px',
                            background: 'white',
                            borderRadius: '50%',
                            transform: 'scale(2)',
                            boxShadow: '0px -15px 20px rgba(0,0,0,0.1)'
                        }
                    }}
                >
                    <Typography
                        variant={isMobile ? "h4" : "h3"}
                        className="header-title"
                        sx={{
                            fontWeight: 800,
                            letterSpacing: '0.5px',
                            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                            animation: 'fadeIn 1s ease-in-out'
                        }}
                    >
                        Gizlilik Politikası
                    </Typography>
                    <Typography
                        variant={isMobile ? "h5" : "h4"}
                        className="header-subtitle"
                        sx={{
                            fontWeight: 600,
                            letterSpacing: '0.5px',
                            animation: 'slideUp 1s ease-in-out'
                        }}
                    >
                        Diyetia.com
                    </Typography>
                </Box>

                <Container component="main" maxWidth="md" className="gizlilik-container" sx={{ zIndex: 10, position: 'relative' }}>
                    <Card
                        elevation={10}
                        sx={{
                            borderRadius: 4,
                            overflow: 'visible',
                            mt: -10,
                            mb: 8,
                            background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
                            boxShadow: '0 8px 40px rgba(0,0,0,0.12), 0 12px 20px rgba(252, 158, 33, 0.15)',
                            position: 'relative'
                        }}
                    >
                        <CardContent sx={{
                            pt: 4,
                            px: isMobile ? 3 : 5,
                            pb: 4
                        }}>
                            <Typography
                                variant="h4"
                                align="center"
                                gutterBottom
                                sx={{
                                    fontWeight: "600",
                                    color: '#333',
                                    mb: 4
                                }}
                            >
                                Gizlilik Politikası
                            </Typography>

                            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#ff7355', mt: 4 }}>
                                1. Kişisel Verilerin Korunması
                            </Typography>
                            <Typography variant="body1" paragraph>
                                Diyetia.com olarak kişisel verilerinizin gizliliği konusunda hassasiyet gösteriyoruz. Bu Gizlilik Politikası, platformumuzu kullanırken sağladığınız kişisel verilerin nasıl toplandığını, kullanıldığını ve korunduğunu açıklamaktadır.
                            </Typography>
                            <Typography variant="body1" paragraph>
                                Platformumuz üzerinden toplanan tüm kişisel veriler, 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında işlenmekte ve saklanmaktadır.
                            </Typography>

                            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#ff7355', mt: 4 }}>
                                2. Toplanan Veriler
                            </Typography>
                            <Typography variant="body1" paragraph>
                                Diyetia.com kullanımı sırasında aşağıdaki kişisel verileriniz toplanabilir:
                            </Typography>
                            <Typography component="div" sx={{ pl: 3 }}>
                                <ul>
                                    <li>
                                        <Typography variant="body1" paragraph>
                                            İsim, telefon numarası, e-posta adresi gibi iletişim bilgileri
                                        </Typography>
                                    </li>
                                    <li>
                                        <Typography variant="body1" paragraph>
                                            Yaş, cinsiyet, boy, kilo gibi demografik bilgiler
                                        </Typography>
                                    </li>
                                    <li>
                                        <Typography variant="body1" paragraph>
                                            Sağlık geçmişi ve mevcut sağlık durumu ile ilgili bilgiler
                                        </Typography>
                                    </li>
                                    <li>
                                        <Typography variant="body1" paragraph>
                                            Beslenme alışkanlıkları ve fiziksel aktivite düzeyleri
                                        </Typography>
                                    </li>
                                    <li>
                                        <Typography variant="body1" paragraph>
                                            Platformdaki etkileşimleriniz ve tercihleriniz
                                        </Typography>
                                    </li>
                                </ul>
                            </Typography>

                            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#ff7355', mt: 4 }}>
                                3. Verilerin Kullanım Amacı
                            </Typography>
                            <Typography variant="body1" paragraph>
                                Toplanan kişisel veriler aşağıdaki amaçlar doğrultusunda kullanılmaktadır:
                            </Typography>
                            <Typography component="div" sx={{ pl: 3 }}>
                                <ul>
                                    <li>
                                        <Typography variant="body1" paragraph>
                                            Size özel diyet ve beslenme planlarının oluşturulması
                                        </Typography>
                                    </li>
                                    <li>
                                        <Typography variant="body1" paragraph>
                                            Sağlık profesyonelleri ile iletişim kurmanızın sağlanması
                                        </Typography>
                                    </li>
                                    <li>
                                        <Typography variant="body1" paragraph>
                                            Platform hizmetlerinin iyileştirilmesi ve kişiselleştirilmesi
                                        </Typography>
                                    </li>
                                    <li>
                                        <Typography variant="body1" paragraph>
                                            İlgili bilgilendirmelerin ve güncellemelerin sağlanması
                                        </Typography>
                                    </li>
                                    <li>
                                        <Typography variant="body1" paragraph>
                                            Yasal yükümlülüklerin yerine getirilmesi
                                        </Typography>
                                    </li>
                                </ul>
                            </Typography>

                            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#ff7355', mt: 4 }}>
                                4. Veri Güvenliği
                            </Typography>
                            <Typography variant="body1" paragraph>
                                Diyetia.com, kişisel verilerinizin güvenliğini sağlamak için endüstri standardı güvenlik önlemlerini uygulamaktadır. Verileriniz, yetkisiz erişim, değişiklik, ifşa veya imhaya karşı çeşitli teknik ve organizasyonel önlemlerle korunmaktadır.
                            </Typography>
                            <Typography variant="body1" paragraph>
                                Bununla birlikte, internet üzerinden hiçbir veri iletiminin veya elektronik depolamanın %100 güvenli olmadığını hatırlatmak isteriz.
                            </Typography>

                            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#ff7355', mt: 4 }}>
                                5. Üçüncü Taraflarla Bilgi Paylaşımı
                            </Typography>
                            <Typography variant="body1" paragraph>
                                Kişisel verileriniz, aşağıdaki durumlar dışında üçüncü taraflarla paylaşılmamaktadır:
                            </Typography>
                            <Typography component="div" sx={{ pl: 3 }}>
                                <ul>
                                    <li>
                                        <Typography variant="body1" paragraph>
                                            Açık rızanız olması durumunda
                                        </Typography>
                                    </li>
                                    <li>
                                        <Typography variant="body1" paragraph>
                                            Yasal bir zorunluluk olması durumunda
                                        </Typography>
                                    </li>
                                    <li>
                                        <Typography variant="body1" paragraph>
                                            Hizmetlerin sunulması için gerekli olduğunda hizmet sağlayıcılarla
                                        </Typography>
                                    </li>
                                </ul>
                            </Typography>

                            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#ff7355', mt: 4 }}>
                                6. Çerezler ve İzleme Teknolojileri
                            </Typography>
                            <Typography variant="body1" paragraph>
                                Diyetia.com, kullanıcı deneyimini geliştirmek ve platformu analiz etmek için çerezler ve benzer teknolojileri kullanabilir. Bu teknolojiler, tercihlerinizi hatırlamak, site trafiğini analiz etmek ve size daha iyi bir deneyim sunmak için kullanılmaktadır.
                            </Typography>

                            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#ff7355', mt: 4 }}>
                                7. Haklarınız
                            </Typography>
                            <Typography variant="body1" paragraph>
                                Kişisel verilerinize ilişkin olarak aşağıdaki haklara sahipsiniz:
                            </Typography>
                            <Typography component="div" sx={{ pl: 3 }}>
                                <ul>
                                    <li>
                                        <Typography variant="body1" paragraph>
                                            Kişisel verilerinizin işlenip işlenmediğini öğrenme
                                        </Typography>
                                    </li>
                                    <li>
                                        <Typography variant="body1" paragraph>
                                            Kişisel verilerinize erişme ve bunların bir kopyasını talep etme
                                        </Typography>
                                    </li>
                                    <li>
                                        <Typography variant="body1" paragraph>
                                            Yanlış veya eksik bilgilerin düzeltilmesini isteme
                                        </Typography>
                                    </li>
                                    <li>
                                        <Typography variant="body1" paragraph>
                                            Belirli koşullar altında kişisel verilerinizin silinmesini talep etme
                                        </Typography>
                                    </li>
                                    <li>
                                        <Typography variant="body1" paragraph>
                                            Verilerinizin işlenmesine itiraz etme
                                        </Typography>
                                    </li>
                                </ul>
                            </Typography>

                            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#ff7355', mt: 4 }}>
                                8. İletişim
                            </Typography>
                            <Typography variant="body1" paragraph>
                                Bu Gizlilik Politikası ile ilgili sorularınız veya talepleriniz için bizimle aşağıdaki kanallardan iletişime geçebilirsiniz:
                            </Typography>
                            <Typography variant="body1" paragraph>
                                E-posta: info@diyetia.com
                            </Typography>
                            <Typography variant="body1" paragraph>
                                Telefon: 0212 XXX XX XX
                            </Typography>

                            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#ff7355', mt: 4 }}>
                                9. Değişiklikler
                            </Typography>
                            <Typography variant="body1" paragraph>
                                Bu Gizlilik Politikası zaman zaman güncellenebilir. Yapılan önemli değişiklikler hakkında sizi bilgilendireceğiz. Yine de, düzenli olarak bu sayfayı ziyaret ederek güncel bilgilere erişmenizi öneririz.
                            </Typography>

                            <Typography variant="body2" sx={{ mt: 6, textAlign: 'center', fontStyle: 'italic', color: '#666' }}>
                                Son güncelleme tarihi: 08.06.2025
                            </Typography>
                        </CardContent>
                    </Card>
                </Container>
            </Box>
        </DefaultWithFooter>
    );
}

export default GizlilikSozlesmesi;

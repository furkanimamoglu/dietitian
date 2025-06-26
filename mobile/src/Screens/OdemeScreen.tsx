import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, StyleSheet, View, Text, Image, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, FlatList } from 'react-native';
import Header from '../Components/Header';
import BottomNavbar from '../Components/BottomNavbar';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import config from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OdemeScreen = ({navigation}) => {
    const [allInvoices, setAllInvoices] = useState([]);
    const [filteredInvoices, setFilteredInvoices] = useState([]);
    const [displayedInvoices, setDisplayedInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const ITEMS_PER_PAGE = 6; // Bir sayfada gösterilecek fatura sayısı
    const apiUrl = config.environment === 'dev' ? config.dev.apiUrl : config.prod.apiUrl;

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = await AsyncStorage.getItem('token');
            if (!token) {
                navigation.navigate('Login');
                return;
            }

            const response = await fetch(`${apiUrl}/invoice/getClientInvoicesAsClient`, {
                method: 'GET',
                headers: {
                    'Authorization': `${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (response.ok) {
                const sortedInvoices = data.sort((a, b) =>
                    new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()
                );
                setAllInvoices(sortedInvoices);
                applyFilters(sortedInvoices, filterStatus, searchQuery);
            } else {
                setError(data.message || 'Faturalar yüklenirken bir hata oluştu.');
            }
        } catch (err) {
            setError('Fatura bilgileri yüklenemedi. Lütfen internet bağlantınızı kontrol edin.');
            console.error('Fatura yükleme hatası:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const applyFilters = useCallback((invoicesData, status, query) => {
        let result = [...invoicesData];

        if (status !== 'all') {
            result = result.filter(invoice => invoice.status === status);
        }

        if (query.trim() !== '') {
            const lowerQuery = query.toLowerCase();
            result = result.filter(invoice =>
                String(invoice.id).includes(lowerQuery) ||
                (invoice.description && invoice.description.toLowerCase().includes(lowerQuery))
            );
        }

        setFilteredInvoices(result);

        const totalPagesCount = Math.ceil(result.length / ITEMS_PER_PAGE);
        setTotalPages(totalPagesCount > 0 ? totalPagesCount : 1);

        setCurrentPage(1);
        loadPage(1, result);
    }, [ITEMS_PER_PAGE]);

    const loadPage = useCallback((pageNumber, data = null) => {
        const invoicesData = data || filteredInvoices;
        const startIndex = (pageNumber - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;

        setDisplayedInvoices(invoicesData.slice(startIndex, endIndex));
    }, [filteredInvoices, ITEMS_PER_PAGE]);

    const changePage = useCallback((pageNumber) => {
        if (pageNumber < 1 || pageNumber > totalPages) return;
        setCurrentPage(pageNumber);
        loadPage(pageNumber);
    }, [totalPages, loadPage]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchInvoices();
    }, []);

    useEffect(() => {
        if (allInvoices.length > 0) {
            applyFilters(allInvoices, filterStatus, searchQuery);
        }
    }, [filterStatus, searchQuery, allInvoices, applyFilters]);

    useEffect(() => {
        fetchInvoices();
    }, []);

    useEffect(() => {
        loadPage(currentPage);
    }, [currentPage, loadPage]);

    const formatDate = (dateString) => {
        if (!dateString) return 'Belirtilmemiş';
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const pageNumbers = [];
        const maxVisiblePages = 5;

        let startPage = 1;
        let endPage = totalPages;

        if (totalPages > maxVisiblePages) {
            const halfVisible = Math.floor(maxVisiblePages / 2);

            if (currentPage <= halfVisible + 1) {
                endPage = maxVisiblePages;
            } else if (currentPage >= totalPages - halfVisible) {
                startPage = totalPages - maxVisiblePages + 1;
            } else {
                startPage = currentPage - halfVisible;
                endPage = currentPage + halfVisible;
            }
        }

        pageNumbers.push(
            <TouchableOpacity
                key="prev"
                style={[styles.pageButton, currentPage === 1 && styles.disabledPageButton]}
                onPress={() => changePage(currentPage - 1)}
                disabled={currentPage === 1}
            >
                <Icon name="chevron-left" size={20} color={currentPage === 1 ? "#999" : "#333"} />
            </TouchableOpacity>
        );

        if (startPage > 1) {
            pageNumbers.push(
                <TouchableOpacity
                    key="1"
                    style={[styles.pageButton, 1 === currentPage && styles.activePageButton]}
                    onPress={() => changePage(1)}
                >
                    <Text style={[styles.pageButtonText, 1 === currentPage && styles.activePageText]}>1</Text>
                </TouchableOpacity>
            );

            if (startPage > 2) {
                pageNumbers.push(
                    <Text key="ellipsis1" style={styles.ellipsis}>...</Text>
                );
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(
                <TouchableOpacity
                    key={i}
                    style={[styles.pageButton, i === currentPage && styles.activePageButton]}
                    onPress={() => changePage(i)}
                >
                    <Text style={[styles.pageButtonText, i === currentPage && styles.activePageText]}>{i}</Text>
                </TouchableOpacity>
            );
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pageNumbers.push(
                    <Text key="ellipsis2" style={styles.ellipsis}>...</Text>
                );
            }

            pageNumbers.push(
                <TouchableOpacity
                    key={totalPages}
                    style={[styles.pageButton, totalPages === currentPage && styles.activePageButton]}
                    onPress={() => changePage(totalPages)}
                >
                    <Text style={[styles.pageButtonText, totalPages === currentPage && styles.activePageText]}>{totalPages}</Text>
                </TouchableOpacity>
            );
        }

        pageNumbers.push(
            <TouchableOpacity
                key="next"
                style={[styles.pageButton, currentPage === totalPages && styles.disabledPageButton]}
                onPress={() => changePage(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                <Icon name="chevron-right" size={20} color={currentPage === totalPages ? "#999" : "#333"} />
            </TouchableOpacity>
        );

        return (
            <View style={styles.paginationContainer}>
                {pageNumbers}
            </View>
        );
    };

    const renderPaymentStatus = (status) => {
        switch (status) {
            case 'paid':
                return (
                    <View style={styles.statusTag}>
                        <Icon name="check-circle" size={16} color="#4CAF50" />
                        <Text style={[styles.statusText, {color: '#4CAF50'}]}> Ödendi</Text>
                    </View>
                );
            case 'partiallypaid':
                return (
                    <View style={styles.statusTag}>
                        <Icon name="clock-outline" size={16} color="#FF9800" />
                        <Text style={[styles.statusText, {color: '#0085ae'}]}> Kısmi Ödendi</Text>
                    </View>
                );
            case 'unpaid':
                return (
                    <View style={styles.statusTag}>
                        <Icon name="alert-circle-outline" size={16} color="#F44336" />
                        <Text style={[styles.statusText, {color: '#FF9800'}]}>Beklemede</Text>
                    </View>
                );
            case 'cancelled':
                return (
                    <View style={styles.statusTag}>
                        <Icon name="close-circle" size={16} color="#F44336" />
                        <Text style={[styles.statusText, {color: '#F44336'}]}>Ödenmedi</Text>
                    </View>
                );
            default:
                return (
                    <View style={styles.statusTag}>
                        <Icon name="help-circle-outline" size={16} color="#999" />
                        <Text style={[styles.statusText, {color: '#999'}]}> Bilinmiyor</Text>
                    </View>
                );
        }
    };

    const renderFilterButtons = () => (
        <View style={styles.filterContainer}>
            <TouchableOpacity
                style={[styles.filterButton, filterStatus === 'all' && styles.activeFilterButton]}
                onPress={() => setFilterStatus('all')}>
                <Text style={[styles.filterButtonText, filterStatus === 'all' && styles.activeFilterText]}>
                    Tümü
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.filterButton, filterStatus === 'paid' && styles.activeFilterButton]}
                onPress={() => setFilterStatus('paid')}>
                <Text style={[styles.filterButtonText, filterStatus === 'paid' && styles.activeFilterText]}>
                    Ödendi
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.filterButton, filterStatus === 'unpaid' && styles.activeFilterButton]}
                onPress={() => setFilterStatus('unpaid')}>
                <Text style={[styles.filterButtonText, filterStatus === 'unpaid' && styles.activeFilterText]}>
                    Bekliyor
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.filterButton, filterStatus === 'cancelled' && styles.activeFilterButton]}
                onPress={() => setFilterStatus('cancelled')}>
                <Text style={[styles.filterButtonText, filterStatus === 'cancelled' && styles.activeFilterText]}>
                    Ödenmedi
                </Text>
            </TouchableOpacity>
        </View>
    );

    const renderInvoiceItem = ({ item }) => (
        <View style={styles.paymentCard}>
            <View style={styles.cardHeader}>
                <Text style={styles.invoiceNumber}>Fatura #{item.id}</Text>
                {renderPaymentStatus(item.status)}
            </View>

            <View style={styles.paymentInfo}>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Fatura Tarihi:</Text>
                    <Text style={styles.infoValue}>{formatDate(item.issueDate)}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Son Ödeme:</Text>
                    <Text style={styles.infoValue}>{formatDate(item.dueDate)}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Hizmet:</Text>
                    <Text style={styles.infoValue}>{item.description || 'Danışmanlık Hizmeti'}</Text>
                </View>

                <View style={[styles.infoRow, styles.amountRow]}>
                    <Text style={styles.infoLabel}>Toplam Tutar:</Text>
                    <Text style={styles.amountValue}>
                        {item.amount} ₺
                    </Text>
                </View>

                {item.status === 'partiallypaid' && (
                    <View style={[styles.infoRow, styles.paidAmountRow]}>
                        <Text style={styles.infoLabel}>Ödenen Tutar:</Text>
                        <Text style={[styles.amountValue, {color: '#4CAF50'}]}>
                            {typeof item.paid_amount === 'number' ? item.paid_amount.toFixed(2) : '0.00'} ₺
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );

    const renderContent = () => {
        if (loading && !refreshing) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#fc9e21" />
                    <Text style={styles.loadingText}>Ödeme geçmişiniz yükleniyor...</Text>
                </View>
            );
        }

        if (error) {
            return (
                <View style={styles.noticeContainer}>
                    <Icon name="alert-circle" size={60} color="#fc9e21" />
                    <Text style={styles.noticeText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchInvoices}>
                        <Text style={styles.retryButtonText}>Tekrar Dene</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (allInvoices.length === 0) {
            return (
                <View style={styles.emptyContainer}>
                    <Icon name="cash-remove" size={70} color="#fc9e21" />
                    <Text style={styles.emptyTitle}>Ödeme Geçmişi Bulunamadı</Text>
                    <Text style={styles.emptyText}>
                        Henüz hiç ödeme işlemi gerçekleştirmediniz veya ödeme geçmişiniz bulunmamaktadır.
                    </Text>
                </View>
            );
        }

        if (filteredInvoices.length === 0) {
            return (
                <View style={styles.emptyContainer}>
                    <Icon name="filter-remove" size={70} color="#fc9e21" />
                    <Text style={styles.emptyTitle}>Filtreye Uygun Fatura Bulunamadı</Text>
                    <Text style={styles.emptyText}>
                        Arama kriterlerinize uygun fatura bulunamadı. Lütfen filtreleri değiştirin.
                    </Text>
                </View>
            );
        }

        return (
            <View style={{flex: 1}}>
                <FlatList
                    data={displayedInvoices}
                    renderItem={renderInvoiceItem}
                    keyExtractor={(item, index) => `invoice-${item.id || index}`}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#fc9e21']} />
                    }
                />
                {renderPagination()}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Header navigation={navigation}/>

            <View style={styles.content}>
                <Text style={styles.sectionTitle}>Ödeme Geçmişim</Text>

                <View style={styles.searchContainer}>
                    <Icon name="magnify" size={20} color="#666" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Fatura no veya hizmet adı ile ara..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        clearButtonMode="always"
                    />
                </View>

                {renderFilterButtons()}

                <View style={styles.resultsContainer}>
                    <Text style={styles.resultsText}>
                        {filteredInvoices.length} fatura bulundu {totalPages > 1 ? `(${currentPage}/${totalPages} sayfa)` : ''}
                    </Text>
                </View>

                {renderContent()}
            </View>

            <BottomNavbar navigation={navigation}/>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5'
    },
    content: {
        flexGrow: 1,
        padding: 16
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 16
    },
    centeredContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666'
    },
    noticeContainer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center'
    },
    noticeText: {
        marginTop: 16,
        marginBottom: 16,
        fontSize: 16,
        color: '#fc9e21',
        textAlign: 'center'
    },
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center'
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fc9e21',
        marginBottom: 12
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 24
    },
    retryButton: {
        backgroundColor: '#fc9e21',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600'
    },
    paymentListContainer: {
        padding: 4
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
        marginLeft: 4
    },
    paymentCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    invoiceNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333'
    },
    statusTag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 16,
        backgroundColor: '#f9f9f9',
    },
    statusText: {
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 4
    },
    paymentInfo: {
        marginBottom: 16
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8
    },
    infoLabel: {
        fontSize: 15,
        color: '#666',
        flex: 1
    },
    infoValue: {
        fontSize: 15,
        color: '#333',
        fontWeight: '500',
        flex: 2,
        textAlign: 'right'
    },
    amountRow: {
        marginTop: 4,
    },
    amountValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fc9e21',
        flex: 2,
        textAlign: 'right'
    },
    paidAmountRow: {
        marginTop: 4,
    },
    detailButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        marginTop: 4
    },
    detailButtonText: {
        fontSize: 15,
        color: '#fc9e21',
        fontWeight: '600',
        marginRight: 6
    },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
        paddingHorizontal: 4
    },
    filterButton: {
        flex: 1,
        backgroundColor: '#f1f1f1',
        borderRadius: 8,
        paddingVertical: 10,
        marginHorizontal: 4,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    activeFilterButton: {
        backgroundColor: '#fc9e21',
        borderColor: '#fc9e21',
    },
    filterButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333'
    },
    activeFilterText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    searchIcon: {
        marginRight: 8
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        paddingVertical: 0,
        paddingRight: 40,
    },
    resultsContainer: {
        marginBottom: 16,
        paddingHorizontal: 4
    },
    resultsText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'right'
    },
    listContainer: {
        paddingBottom: 16
    },
    footerLoading: {
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center'
    },
    footerText: {
        marginTop: 8,
        fontSize: 14,
        color: '#666'
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        marginTop: 8
    },
    pageButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#f1f1f1',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    activePageButton: {
        backgroundColor: '#fc9e21',
        borderColor: '#fc9e21',
    },
    disabledPageButton: {
        opacity: 0.5,
    },
    pageButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333'
    },
    activePageText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    ellipsis: {
        fontSize: 16,
        color: '#666',
        marginHorizontal: 4
    }
});

export default OdemeScreen;

import React, { useState } from 'react';
import './Beslenme.css';
import Default from "../../../components/Layouts/Default.jsx";
import {
    Box,
    Button,
    Card,
    CardActionArea,
    CardContent,
    CardMedia,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Grid2,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Paper,
    TextField,
    Tooltip,
    Typography
} from "@mui/material";

import { Add } from "@mui/icons-material";
import DeleteIcon from '@mui/icons-material/Delete';
import PrintIcon from '@mui/icons-material/Print';
import EditIcon from '@mui/icons-material/Edit';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Autocomplete from '@mui/material/Autocomplete';

const danisanList = [
    { id: 1, label: "Ahmet Yılmaz" },
    { id: 2, label: "Ayşe Demir" },
    { id: 3, label: "John Doe" },
    { id: 4, label: "Jane Smith" },
];

const initialCategories = [
    { id: 1, name: "Diyet" },
    { id: 2, name: "Sağlık" },
    { id: 3, name: "Çölyak" },
];

const initialBeslenmeData = [
    { id: 1, title: "Kilo Aldırma", description: "x2 yumurta, 5x furkan, 500 gr peynir", image: "/kiloal.png" },
    { id: 2, title: "Kilo Verme", description: "x1 yumurta, 1x elma, 200 gr yoğurt", image: "/placeholder.png" },
    { id: 3, title: "Kas Yapımı", description: "x3 yumurta, 300 gr tavuk, 1x muz", image: "/placeholder.png" },
    { id: 4, title: "Dengeli Beslenme", description: "x1 avokado, 200 gr yulaf, 1x yoğurt", image: "/placeholder.png" },
    {
        id: 5,
        title: "Sağlıklı Atıştırma",
        description: "x2 ceviz, 1x hurma, 50 gr bitter çikolata",
        image: "/placeholder.png"
    },
    { id: 6, title: "Protein Ağırlıklı", description: "x5 yumurta, 200 gr hindi, 2x muz", image: "/placeholder.png" },
];

// 3'lü gruplama fonksiyonu (kartlar satır satır gelsin)
const groupByThree = (data) => {
    const groups = [];
    for (let i = 0; i < data.length; i += 3) {
        groups.push(data.slice(i, i + 3));
    }
    return groups;
};

export default function Beslenme() {
    const [categoryData, setCategoryData] = useState(initialCategories);
    const [checkedCategories, setCheckedCategories] = useState([]); // Seçili kategorilerin ID'lerini tutar

    const [beslenmeData, setBeslenmeData] = useState(initialBeslenmeData);

    // Danışana Ekle Modal State'leri
    const [openModal, setOpenModal] = useState(false);
    const [selectedBeslenmeProgram, setSelectedBeslenmeProgram] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);

    // Detay Modal (Kart Resmine Tıklandığında Açılan Büyük Modal)
    const [openDetailModal, setOpenDetailModal] = useState(false);
    const [detailItem, setDetailItem] = useState(null);

    const groupedData = groupByThree(beslenmeData);

    // Kategori Seçimi (Checkbox)
    const handleCategoryCheck = (categoryId) => {
        if (checkedCategories.includes(categoryId)) {
            // Zaten seçili ise çıkart
            setCheckedCategories(checkedCategories.filter((id) => id !== categoryId));
        } else {
            // Değilse ekle
            setCheckedCategories([...checkedCategories, categoryId]);
        }
    };

    // Toplu Sil Butonu (Sol Panel)
    const handleMultiDelete = () => {
        // Seçili kategorileri sil
        const newCategoryData = categoryData.filter(
            (cat) => !checkedCategories.includes(cat.id)
        );
        setCategoryData(newCategoryData);
        setCheckedCategories([]); // silindikten sonra listeyi temizle
    };

    // Hover'daki Tekil Sil (Sol Panel)
    const handleSingleCategoryDelete = (categoryId) => {
        const newCategoryData = categoryData.filter((cat) => cat.id !== categoryId);
        setCategoryData(newCategoryData);

        // Eğer checkbox işaretli kategorilerden biriyse, onu da çıkar
        if (checkedCategories.includes(categoryId)) {
            setCheckedCategories(checkedCategories.filter((id) => id !== categoryId));
        }
    };

    // Sağ Panel: Danışana Ekle Modalları
    const handleOpenModal = (item) => {
        setSelectedBeslenmeProgram(item);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedBeslenmeProgram(null);
        setSelectedUser(null); // temizleyelim
    };

    const handleAddToUser = () => {
        //TODO: Tarifi, seçilen kullanıcıya bağlayacak bir sistem yazılacak (API vb.)
        console.log("Seçilen program:", selectedBeslenmeProgram);
        console.log("Eklemek istediğin danışan:", selectedUser);

        handleCloseModal();
    };

    // Yazdır
    const handlePrint = (item) => {
        //TODO: PDF veya Print sistemi
        console.log("Yazdırılacak Program:", item);
        window.print();
    };

    // Sağ Panel Sil
    const handleDelete = (item) => {
        const yeniListe = beslenmeData.filter((dataItem) => dataItem.id !== item.id);
        setBeslenmeData(yeniListe);
    };

    // Kart Resmine Tıklayınca Detay Modal Aç
    const handleCardImageClick = (item) => {
        setDetailItem(item);
        setOpenDetailModal(true);
    };

    const handleDetailModalClose = () => {
        setOpenDetailModal(false);
        setDetailItem(null);
    };

    return (
        <Default>
            <Grid2 container sx={{ height: '100%' }}>
                {/* Sol Panel */}
                <Grid2
                    container
                    sx={{ height: '78vh', flex: 1, display: { xs: 'none', sm: 'flex' } }}
                    direction="column"
                    spacing={2}
                >
                    <Grid2>
                        <Paper elevation={3} sx={{ minHeight: "78vh", p: "0.5rem" }}>
                            {/* Search and Add */}
                            <Grid2 container alignItems="center" spacing={2}>
                                <Grid2 xs={12}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        placeholder="Ara..."
                                        variant="outlined"
                                    />
                                </Grid2>
                                <Grid2 container sx={{ ml: 'auto', mr: '1rem', gap: '0.5rem' }}>
                                    <Grid2>
                                        <Button variant="contained" color="primary">
                                            <Add />
                                        </Button>
                                    </Grid2>
                                    <Grid2>
                                        <Button
                                            variant="contained"
                                            onClick={handleMultiDelete}
                                            sx={{
                                                backgroundColor: '#a50000',
                                                '&:hover': { backgroundColor: '#ff0000' },
                                            }}
                                        >
                                            <DeleteIcon />
                                        </Button>
                                    </Grid2>
                                </Grid2>
                            </Grid2>

                            {/* Kategori Listesi */}
                            <List
                                sx={{
                                    maxHeight: '70vh',
                                    overflowY: 'auto',
                                    overflowX: 'hidden',
                                    mt: 1
                                }}
                            >
                                {categoryData.map((category) => (
                                    <ListItem
                                        key={category.id}
                                        sx={{
                                            '&:hover': { backgroundColor: '#f5f5f5' },
                                            '&:hover .delete-button': { visibility: 'visible' },
                                            transition: 'background-color 0.2s',
                                            cursor: 'pointer',
                                        }}
                                        onClick={() => handleCategoryCheck(category.id)}
                                    >
                                        <ListItemIcon>
                                            <Checkbox
                                                edge="start"
                                                checked={checkedCategories.includes(category.id)}
                                                tabIndex={-1}
                                                disableRipple
                                            />
                                        </ListItemIcon>
                                        <ListItemText primary={category.name.toString()} />

                                        <Box
                                            className="delete-button"
                                            sx={{
                                                position: 'absolute',
                                                right: 0,
                                                top: '50%',
                                                mr: "1rem",
                                                transform: 'translateY(-50%)',
                                                visibility: 'hidden',
                                            }}
                                        >
                                            <IconButton
                                                edge="end"
                                                aria-label="delete"
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Checkbox event'i tetiklenmesin
                                                    handleSingleCategoryDelete(category.id);
                                                }}
                                                sx={{
                                                    '&:hover': { backgroundColor: '#ff0000' },
                                                    backgroundColor: "#a50000",
                                                    color: 'white'
                                                }}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Box>
                                    </ListItem>
                                ))}
                            </List>
                            {/* Kategori Listesi - End */}
                        </Paper>
                    </Grid2>
                </Grid2>

                {/* Sağ Panel */}
                <Grid2
                    container
                    spacing={2}
                    sx={{ maxHeight: '79.4vh', width: "74vw", ml: "1rem", overflowY: 'auto' }}
                >
                    {groupedData.map((group, groupIndex) => (
                        <React.Fragment key={groupIndex}>
                            {group.map((item) => (
                                <Grid2 xs={12} sm={4} md={4} key={item.id}>
                                    <Card sx={{ minWidth: 410, boxShadow: 3 }}>
                                        <CardActionArea onClick={() => handleCardImageClick(item)}>
                                            <CardMedia
                                                component="img"
                                                image={item.image.toString() || "/placeholder.png"}
                                                alt={item.title.toString()}
                                                sx={{
                                                    height: 250,
                                                    width: 410,
                                                    objectFit: 'cover',
                                                }}
                                            />
                                        </CardActionArea>
                                        <CardContent>
                                            <Typography gutterBottom variant="h5" component="div">
                                                {item.title.toString()}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                {item.description.toString()}
                                            </Typography>

                                            {/* Card Butonları */}
                                            <Box
                                                sx={{
                                                    mt: 2,
                                                    gap: "0.5rem",
                                                    display: 'flex',
                                                    justifyContent: 'flex-end'
                                                }}
                                            >
                                                {/* Danışana Ekle */}
                                                <Tooltip title={"Danışana Ekle"} arrow>
                                                    <IconButton
                                                        aria-label="danisana-ekle"
                                                        sx={{
                                                            backgroundColor: '#3d8a3d',
                                                            color: 'white',
                                                            '&:hover': { backgroundColor: '#53c153' },
                                                        }}
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // Kart detayına gitmesin
                                                            handleOpenModal(item);
                                                        }}
                                                    >
                                                        <PersonAddIcon />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title={"Yazdır"} arrow>
                                                    <IconButton
                                                        aria-label="print"
                                                        sx={{
                                                            backgroundColor: '#003095',
                                                            color: 'white',
                                                            '&:hover': { backgroundColor: '#0052ff' },
                                                        }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handlePrint(item);
                                                        }}
                                                    >
                                                        <PrintIcon />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title={"Düzenle"} arrow>
                                                    <IconButton
                                                        aria-label="duzenle"
                                                        sx={{
                                                            backgroundColor: '#ff9e25',
                                                            color: 'white',
                                                            '&:hover': { backgroundColor: '#ffaf4b' },
                                                        }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            console.log("Düzenleme tıklandı:", item.title);
                                                        }}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>

                                                {/* Sil */}
                                                <Tooltip title={"Sil"} arrow>
                                                    <IconButton
                                                        aria-label="sil"
                                                        sx={{
                                                            backgroundColor: '#a50000',
                                                            color: 'white',
                                                            '&:hover': { backgroundColor: '#ff0000' },
                                                        }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(item);
                                                        }}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid2>
                            ))}
                        </React.Fragment>
                    ))}
                </Grid2>
            </Grid2>

            {/* Danışana Ekle Modal */}
            <Dialog open={openModal} onClose={handleCloseModal}>
                <DialogTitle>Danışana Ekle</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Seçilen program: <strong>{selectedBeslenmeProgram?.title}</strong>
                    </DialogContentText>
                    <Box sx={{ mt: 2 }}>
                        <Autocomplete
                            fullWidth
                            options={danisanList}
                            getOptionLabel={(option) => option.label}
                            value={selectedUser}
                            onChange={(e, newValue) => setSelectedUser(newValue)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Danışan Seç"
                                    variant="outlined"
                                />
                            )}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal}>Vazgeç</Button>
                    <Button onClick={handleAddToUser} variant="contained">
                        Ekle
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Kart Detay Modal (Büyük Modal) */}
            <Dialog open={openDetailModal} onClose={handleDetailModalClose} maxWidth="sm" fullWidth>
                <DialogTitle>{detailItem?.title}</DialogTitle>
                <DialogContent>
                    {/* Büyük resim veya detaylar buraya */}
                    <DialogContentText sx={{ mb: 2 }}>
                        {detailItem?.description}
                    </DialogContentText>
                    {detailItem?.image && (
                        <Box
                            component="img"
                            sx={{ width: '100%', borderRadius: 2 }}
                            alt={detailItem.title}
                            src={detailItem.image}
                        />
                    )}
                    {/* Daha fazla metin veya öğe ekleyebilirsiniz */}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDetailModalClose}>Kapat</Button>
                </DialogActions>
            </Dialog>
        </Default>
    );
}

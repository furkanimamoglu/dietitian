import React, { useState } from 'react';
import './Beslenme.css';
import Default from "../../components/Layouts/Default.jsx";
import {
    Box,
    Button,
    Card,
    CardActionArea,
    CardContent,
    CardMedia,
    Checkbox,
    Grid2,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Paper,
    TextField,
    Tooltip,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from "@mui/material";
import {Add} from "@mui/icons-material";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from '@mui/icons-material/Delete';
import PrintIcon from '@mui/icons-material/Print';
import EditIcon from '@mui/icons-material/Edit';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const initialBeslenmeData = [
    {id: 1, title: "Kilo Aldırma", description: "x2 yumurta, 5x furkan, 500 gr peynir", image: "/kiloal.png"},
    {id: 2, title: "Kilo Verme", description: "x1 yumurta, 1x elma, 200 gr yoğurt", image: "/placeholder.png"},
    {id: 3, title: "Kas Yapımı", description: "x3 yumurta, 300 gr tavuk, 1x muz", image: "/placeholder.png"},
    {id: 4, title: "Dengeli Beslenme", description: "x1 avokado, 200 gr yulaf, 1x yoğurt", image: "/placeholder.png"},
    {
        id: 5,
        title: "Sağlıklı Atıştırma",
        description: "x2 ceviz, 1x hurma, 50 gr bitter çikolata",
        image: "/placeholder.png"
    },
    {id: 6, title: "Protein Ağırlıklı", description: "x5 yumurta, 200 gr hindi, 2x muz", image: "/placeholder.png"},
    {
        id: 7,
        title: "Glutensiz Diyet",
        description: "x2 avokado, 1x yulaf sütü, 100 gr çilek",
        image: "/placeholder.png"
    },
    {id: 8, title: "Enerji Diyeti", description: "x1 muz, 1x fıstık ezmesi, 50 gr ceviz", image: "/placeholder.png"},
    {id: 9, title: "Karbonhidrat Dengesi", description: "x2 patates, 1x pilav, 1x tavuk", image: "/placeholder.png"},
    {
        id: 10,
        title: "Glutensiz Diyet",
        description: "x2 avokado, 1x yulaf sütü, 100 gr çilek",
        image: "/placeholder.png"
    },
    {id: 11, title: "Enerji Diyeti", description: "x1 muz, 1x fıstık ezmesi, 50 gr ceviz", image: "/placeholder.png"},
    {id: 12, title: "Karbonhidrat Dengesi", description: "x2 patates, 1x pilav, 1x tavuk", image: "/placeholder.png"}
];

const beslenmePlanlari = [
    {id: 1, label: "Kilo Aldırma", category: "Diyet"},
    {id: 2, label: "Kilo Verme", category: "Diyet"},
    {id: 3, label: "Kas Yapımı", category: "Diyet"},
    {id: 4, label: "Dengeli Beslenme", category: "Sağlık"},
    {id: 5, label: "Sağlıklı Atıştırma", category: "Sağlık"},
    {id: 6, label: "Protein Ağırlıklı", category: "Diyet"},
    {id: 7, label: "Diyabet", category: "Hastalık"},
    {id: 8, label: "Glutensiz Diyet", category: "Diyet"},
    {id: 9, label: "Enerji Diyeti", category: "Diyet"},
    {id: 10, label: "Karbonhidrat Dengesi", category: "Diyet"},
    {id: 11, label: "Çölyak Hastalığı", category: "Hastalık"},
    {id: 12, label: "Şekersiz", category: "Diyet"},
    {id: 13, label: "Option 13", category: "Diğer"},
    {id: 14, label: "Option 14", category: "Diğer"},
    {id: 15, label: "Option 15", category: "Diğer"},
    {id: 16, label: "Option 16", category: "Diğer"},
    {id: 17, label: "Option 17", category: "Diğer"},
    {id: 18, label: "Option 18", category: "Diğer"},
    {id: 19, label: "Option 19", category: "Diğer"},
    {id: 20, label: "Option 20", category: "Diğer"},
    {id: 21, label: "Option 21", category: "Diğer"},
    {id: 22, label: "Option 22", category: "Diğer"},
    {id: 23, label: "Option 23", category: "Diğer"},
];

const beslenmeKategorileri = [
    { id: 1, name: "Diyet" },
    { id: 2, name: "Sağlık" },
    { id: 3, name: "Çölyak" }
];

const groupByThree = (data) => {
    const groups = [];
    for (let i = 0; i < data.length; i += 3) {
        groups.push(data.slice(i, i + 3));
    }
    return groups;
};

export default function Beslenme() {
    const [beslenmeData, setBeslenmeData] = useState(initialBeslenmeData);

    const [openModal, setOpenModal] = useState(false);

    const [selectedBeslenmeProgram, setSelectedBeslenmeProgram] = useState(null);

    const [selectedUser, setSelectedUser] = useState("");

    const groupedData = groupByThree(beslenmeData);

    const handleOpenModal = (item) => {
        setSelectedBeslenmeProgram(item);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedBeslenmeProgram(null);
    };

    const handleAddToUser = () => {
        //TODO: Tarifi, kullanıcıya bağlayacak bir sistem yazılacak
        console.log("Seçilen program:", selectedBeslenmeProgram);
        console.log("Eklemek istediğin danışan:", selectedUser);

        handleCloseModal();
    };

    const handlePrint = (item) => {
        //TODO: Buraya PDF oluşturup, çıkartmaya hazır hale getirip printletecek bir sistem yazılacak.
        console.log("Yazdırılacak Program:", item);
        window.print();
    };

    // Sil
    const handleDelete = (item) => {
        const yeniListe = beslenmeData.filter((dataItem) => dataItem.id !== item.id);
        setBeslenmeData(yeniListe);
    };

    return (
        <Default>
            <Grid2 container sx={{height: '100%'}}>
                {/* Sol Panel */}
                {/* TODO: xs versiyonu yapılacak */}
                <Grid2
                    container
                    sx={{height: '78vh', flex: 1, display: { xs: 'none', sm: 'flex' }}}
                    direction="column"
                    spacing={2}
                >
                    <Grid2>
                        <Paper elevation={3} sx={{ minHeight:"78vh" , p: "0.5rem"}}>
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
                                <Grid2 container sx={{ml: 'auto', mr: '1rem'}}>
                                    <Grid2>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                        >
                                            <Add/>
                                        </Button>
                                    </Grid2>
                                    <Grid2>
                                        <Button
                                            variant="contained"
                                            sx={{
                                                backgroundColor: '#a50000',
                                                '&:hover': {backgroundColor: '#ff0000'},
                                            }}
                                        >
                                            <DeleteIcon/>
                                        </Button>
                                    </Grid2>
                                </Grid2>
                            </Grid2>

                            {/* Selectable List */}
                            <List sx={{maxHeight: '78vh', overflowY: 'auto', overflowX: 'hidden'}}>
                                {beslenmeKategorileri.map((category) => (
                                    <ListItem
                                        key={category.id}
                                        sx={{
                                            '&:hover': {backgroundColor: '#f5f5f5'},
                                            '&:hover .delete-button': {visibility: 'visible'},
                                        }}
                                        onClick={()=>{console.log("Kategori tıklandı:", category.name)}}
                                    >
                                        <ListItemIcon>
                                            <Checkbox edge="start"/>
                                        </ListItemIcon>
                                        <ListItemText primary={category.name.toString()}/>

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
                                                sx={{
                                                    '&:hover': {backgroundColor: '#ff0000'},
                                                    backgroundColor: "#a50000",
                                                    color: 'white'
                                                }}
                                            >
                                                <DeleteIcon/>
                                            </IconButton>
                                        </Box>
                                    </ListItem>
                                ))}
                            </List>
                            {/* Selectable List - End */}
                        </Paper>
                    </Grid2>
                </Grid2>

                {/* Sağ Panel */}
                {/* Beslenme Plan Kartlar - Start */}
                <Grid2 container spacing={2} sx={{maxHeight: '79.4vh', width: "74vw", ml: "1rem", overflowY: 'auto'}}>
                    {groupedData.map((group, groupIndex) => (
                        <React.Fragment key={groupIndex}>
                            {group.map((item) => (
                                <Grid2 xs={12} sm={4} md={4} key={item.id}>
                                    <Card sx={{minWidth: 410, boxShadow: 3}}>
                                        <CardActionArea>
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
                                            <Typography variant="body2" sx={{color: 'text.secondary'}}>
                                                {item.description.toString()}
                                            </Typography>

                                            {/* Card Buttons */}
                                            <Box sx={{
                                                mt: 2,
                                                gap: "0.5rem",
                                                display: 'flex',
                                                justifyContent: 'flex-end'
                                            }}>
                                                {/* Danışana Ekle */}
                                                <Tooltip title={"Danışana Ekle"} arrow>
                                                    <IconButton
                                                        aria-label="danisana-ekle"
                                                        sx={{
                                                            backgroundColor: '#3d8a3d',
                                                            color: 'white',
                                                            '&:hover': { backgroundColor: '#53c153'},
                                                        }}
                                                        onClick={() => handleOpenModal(item)}
                                                    >
                                                        <PersonAddIcon/>
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title={"Yazdır"} arrow>
                                                    <IconButton
                                                        aria-label="print"
                                                        sx={{
                                                            backgroundColor: '#003095',
                                                            color: 'white',
                                                            '&:hover': { backgroundColor: '#0052ff'},
                                                        }}
                                                        onClick={() => handlePrint(item)}
                                                    >
                                                        <PrintIcon/>
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title={"Düzenle"} arrow>
                                                    <IconButton
                                                        aria-label="duzenle"
                                                        sx={{
                                                            backgroundColor: '#ff9e25',
                                                            color: 'white',
                                                            '&:hover': { backgroundColor: '#ffaf4b'},
                                                        }}
                                                    >
                                                        <EditIcon/>
                                                    </IconButton>
                                                </Tooltip>

                                                {/* Sil */}
                                                <Tooltip title={"Sil"} arrow>
                                                    <IconButton
                                                        aria-label="sil"
                                                        sx={{
                                                            backgroundColor: '#a50000',
                                                            color: 'white',
                                                            '&:hover': { backgroundColor: '#ff0000'},
                                                        }}
                                                        onClick={() => handleDelete(item)}
                                                    >
                                                        <DeleteIcon/>
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
                {/* Beslenme Plan Kartlar - End */}
            </Grid2>

            {/* Danışana Ekle Modal */}
            <Dialog open={openModal} onClose={handleCloseModal}>
                <DialogTitle>Danışana Ekle</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Seçilen program: <strong>{selectedBeslenmeProgram?.title}</strong>
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Danışan Adı"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={selectedUser}
                        onChange={(e) => setSelectedUser(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal}>Vazgeç</Button>
                    <Button onClick={handleAddToUser} variant="contained">
                        Ekle
                    </Button>
                </DialogActions>
            </Dialog>
        </Default>
    );
}

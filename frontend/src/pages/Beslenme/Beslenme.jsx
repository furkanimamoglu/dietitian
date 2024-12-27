import React from 'react';
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
    Typography
} from "@mui/material";
import {Add} from "@mui/icons-material";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from '@mui/icons-material/Delete';
import PrintIcon from '@mui/icons-material/Print';
import EditIcon from '@mui/icons-material/Edit';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
// Örnek veri
const beslenmeData = [
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
    {id: 1, label: "Option 1"},
    {id: 2, label: "Option 2"},
    {id: 3, label: "Option 3"},
    {id: 4, label: "Option 4"},
    {id: 5, label: "Option 5"},
    {id: 6, label: "Option 6"},
    {id: 7, label: "Option 7"},
    {id: 8, label: "Option 8"},
    {id: 9, label: "Option 9"},
    {id: 10, label: "Option 10"},
    {id: 11, label: "Option 11"},
    {id: 12, label: "Option 12"},
    {id: 13, label: "Option 13"},
    {id: 14, label: "Option 14"},
    {id: 15, label: "Option 15"},
    {id: 16, label: "Option 16"},
    {id: 17, label: "Option 17"},
    {id: 18, label: "Option 18"},
    {id: 19, label: "Option 19"},
    {id: 20, label: "Option 20"},
    {id: 21, label: "Option 21"},
    {id: 22, label: "Option 22"},
    {id: 23, label: "Option 23"},
];

// Verileri her 3 elemanda bir gruplara ayıran yardımcı fonksiyon
const groupByThree = (data) => {
    const groups = [];
    for (let i = 0; i < data.length; i += 3) {
        groups.push(data.slice(i, i + 3));
    }
    return groups;
};

export default function Beslenme() {
    const groupedData = groupByThree(beslenmeData);

    return (
        <Default>
            <Grid2 container sx={{height: '100%'}}>
                {/* Sol Panel */}
                <Grid2 container sx={{height: '80vh', flex: 1}} direction="column" spacing={2}>
                    <Grid2 item>
                        <Paper elevation={3} sx={{p: "0.5rem"}}>
                            {/* Search and Add */}
                            <Grid2 container alignItems="center" spacing={2}>
                                <Grid2 xs>
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
                                            sx={{backgroundColor: '#a50000'}}
                                        >
                                            <DeleteIcon/>
                                        </Button>
                                    </Grid2>
                                </Grid2>
                            </Grid2>

                            {/* Selectable List */}
                            <List sx={{maxHeight: '79vh', overflowY: 'auto', overflowX: 'hidden'}}>
                                {beslenmePlanlari.map((item) => (
                                    <ListItem
                                        key={item.id}
                                        sx={{
                                            '&:hover': {backgroundColor: '#f5f5f5'},
                                            '&:hover .delete-button': {visibility: 'visible'},
                                        }}
                                    >
                                        <ListItemIcon>
                                            <Checkbox edge="start"/>
                                        </ListItemIcon>
                                        <ListItemText primary={item.label}/>

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
                                                sx={{color: 'red'}}
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
                <Grid2 container spacing={2} sx={{maxHeight: '80vh', width: "74vw", ml: "1rem", overflowY: 'auto'}}>
                    {groupedData.map((group, groupIndex) => (
                        <React.Fragment key={groupIndex}>
                            {group.map((item) => (
                                <Grid2 item xs={12} sm={4} md={4} key={item.id}>
                                    <Card sx={{minWidth: 410, boxShadow: 3}}>
                                        <CardActionArea>
                                            <CardMedia
                                                component="img"
                                                image={item.image || "/placeholder.png"}
                                                alt={item.title}
                                                sx={{
                                                    height: 250,
                                                    width: 410,
                                                    objectFit: 'cover',
                                                }}
                                            />
                                        </CardActionArea>
                                        <CardContent>
                                            <Typography gutterBottom variant="h5" component="div">
                                                {item.title}
                                            </Typography>
                                            <Typography variant="body2" sx={{color: 'text.secondary'}}>
                                                {item.description}
                                            </Typography>

                                            {/* Card Buttons */}
                                            <Box sx={{
                                                mt: 2,
                                                gap: "0.5rem",
                                                display: 'flex',
                                                justifyContent: 'flex-end'
                                            }}>
                                                <Tooltip title={"Danışana Ekle"} arrow>
                                                    <IconButton aria-label="danisana-ekle"
                                                                sx={{
                                                                    backgroundColor: '#3d8a3d',
                                                                    color: 'white',
                                                                    '&:hover': {
                                                                        backgroundColor: '#53c153', // Hover'da arka plan değişmesin
                                                                    },
                                                                }}>
                                                        <PersonAddIcon/>
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title={"Yazdır"} arrow>
                                                    <IconButton aria-label="print"
                                                                sx={{
                                                                    backgroundColor: '#003095',
                                                                    color: 'white',
                                                                    '&:hover': {
                                                                        backgroundColor: '#0052ff', // Hover'da arka plan değişmesin
                                                                    },
                                                                }}>
                                                        <PrintIcon/>
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title={"Düzenle"} arrow>
                                                    <IconButton aria-label="duzenle"
                                                                sx={{
                                                                    backgroundColor: '#ff9e25',
                                                                    color: 'white',
                                                                    '&:hover': {
                                                                        backgroundColor: '#ffaf4b', // Hover'da arka plan değişmesin
                                                                    },
                                                                }}>
                                                        <EditIcon/>
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title={"Sil"} arrow>
                                                    <IconButton aria-label="sil"
                                                                sx={{
                                                                    backgroundColor: '#a50000',
                                                                    color: 'white',
                                                                    '&:hover': {
                                                                        backgroundColor: '#ff0000', // Hover'da arka plan değişmesin
                                                                    },
                                                                }}>
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
        </Default>
    );
}
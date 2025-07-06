import axios from "axios";
import config from "../../config.js";

export const saveRecipe = (requestData, callbacks) => {
    const {
        setSuccessMessage,
        setShowSuccessPopup,
        setNewRecipe,
        setImagePreview,
        setAddRecipeModal,
        setIsSaving,
        setErrorMessage,
        setShowErrorPopup,
        fetchRecipes
    } = callbacks;

    if (typeof requestData.image === 'object' || Array.isArray(requestData.image)) {
        setErrorMessage("Resim yükleme hatası: Lütfen önce resmi yükleyin.");
        setShowErrorPopup(true);
        setIsSaving(false);
        return;
    }

    axios.post(`${config[config.environment].apiUrl}/recipe/addRecipe`, requestData, {
        headers: {
            Authorization: localStorage.getItem("token"),
            'Content-Type': 'application/json'
        },
    })
    .then(response => {
        fetchRecipes();

        // Show success message
        setSuccessMessage("Tarif başarıyla eklendi.");
        setShowSuccessPopup(true);

        setNewRecipe({
            title: '',
            description: '',
            ingredients: '',
            instructions: '',
            category_id: '',
            image: null,
            nutritional_info: {
                calories: '', protein: '', carbs: '', fat: ''
            }
        });
        setImagePreview('');
        setAddRecipeModal(false);
        setIsSaving(false);
    })
    .catch(error => {
        console.error("Error adding recipe:", error);
        setErrorMessage("Tarif eklenirken bir hata oluştu.");
        setShowErrorPopup(true);
        setIsSaving(false);
    });
};

export const updateRecipe = (recipeData, callbacks) => {
    const {
        setRecipeData,
        setSuccessMessage,
        setShowSuccessPopup,
        setIsSaving,
        setEditRecipeModal,
        setErrorMessage,
        setShowErrorPopup
    } = callbacks;

    if (typeof recipeData.image === 'object' || Array.isArray(recipeData.image)) {
        setErrorMessage("Resim yükleme hatası: Lütfen önce resmi yükleyin.");
        setShowErrorPopup(true);
        setIsSaving(false);
        return;
    }

    axios.put(`${config[config.environment].apiUrl}/recipe/updateRecipe`, recipeData, {
        headers: {
            Authorization: localStorage.getItem("token"),
            'Content-Type': 'application/json'
        },
    })
    .then(response => {
        const updatedRecipe = {
            id: response.data.id,
            title: response.data.name,
            description: response.data.description || "",
            category_id: response.data.category_id,
            image: recipeData.image || "/placeholder.png",
            video_url: response.data.hasVideo ? response.data.video : "",
            ingredients: response.data.malzemeler,
            instructions: response.data.hazirlanis,
            nutritional_info: {
                calories: response.data.kcal,
                protein: response.data.protein,
                carbs: response.data.karbonhidrat,
                fat: response.data.yag
            }
        };

        setRecipeData(prev => prev.map(recipe => recipe.id === recipeData.recipe_id ? updatedRecipe : recipe));

        setSuccessMessage(`"${recipeData.name}" tarifi başarıyla güncellendi.`);
        setShowSuccessPopup(true);

        setIsSaving(false);
        setEditRecipeModal(false);
    })
    .catch(error => {
        console.error("Error updating recipe:", error);
        setErrorMessage("Tarif güncellenirken bir hata oluştu.");
        setShowErrorPopup(true);
        setIsSaving(false);
    });
};

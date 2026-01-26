import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import tw from '../../lib/tw';
import { Typography } from '../atoms/Typography';
import { RecipeBundle } from '../../services/recipe/RecipeService.v1';
import { COLORS } from '../../lib/theme';
import { Clock, ChefHat } from 'lucide-react-native';

interface RecipeCardProps {
    recipe: RecipeBundle;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
    return (
        <View style={tw`mr-4 w-72 bg-white rounded-xl border border-gray-200 overflow-hidden`}>
            {/* Image Cover */}
            <View style={tw`h-32 w-full bg-gray-200 items-center justify-center overflow-hidden`}>
                <Image source={{ uri: recipe.image }} style={tw`w-full h-full`} resizeMode="cover" />
                {/* Overlay Badge */}
                <View style={tw`absolute top-2 right-2 bg-white px-2 py-1 rounded-lg flex-row items-center shadow-sm`}>
                    <Clock size={12} color="#000" />
                    <Typography variant="tiny" style={tw`ml-1 font-bold text-black`}>{recipe.cookingTime}</Typography>
                </View>
            </View>

            {/* Content */}
            <View style={tw`p-3`}>
                <Typography variant="h3" style={tw`mb-1`}>{recipe.name}</Typography>
                <Typography variant="body" style={tw`text-xs text-gray-500 mb-3`} numberOfLines={2}>
                    {recipe.description}
                </Typography>

                {/* Bundle Footer */}
                <View style={tw`flex-row justify-between items-center bg-gray-50 p-2 rounded-lg`}>
                    <View>
                        <Typography variant="tiny" color="#666">Bundle Price</Typography>
                        <Typography variant="h3">£{recipe.totalPrice.toFixed(2)}</Typography>
                    </View>

                    <TouchableOpacity style={tw`bg-black px-4 py-2 rounded-lg flex-row items-center`}>
                        <ChefHat size={14} color="#FFF" style={tw`mr-2`} />
                        <Typography variant="h3" color="#FFF" style={tw`text-xs`}>Cook This</Typography>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

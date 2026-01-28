import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import tw from '../../lib/tw';
import { Typography } from '../atoms/Typography';
import { RecipeBundle } from '../../services/recipe/RecipeService.v1';
import { COLORS } from '../../lib/theme';
import { Clock, ChefHat } from 'lucide-react-native';

interface RecipeCardProps {
    recipe: RecipeBundle;
    onAdd?: () => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onAdd }) => {
    return (
        <View style={tw`mr-4 w-72 bg-white rounded-xl border border-gray-200 overflow-hidden`}>
            {/* ... */}

            {/* Content */}
            <View style={tw`p-3`}>
                {/* ... */}

                {/* Bundle Footer */}
                <View style={tw`flex-row justify-between items-center bg-gray-50 p-2 rounded-lg`}>
                    <View>
                        <Typography variant="tiny" color="#666">Bundle Price</Typography>
                        <Typography variant="h3">£{recipe.totalPrice.toFixed(2)}</Typography>
                    </View>

                    <TouchableOpacity
                        onPress={onAdd}
                        style={tw`bg-black px-4 py-2 rounded-lg flex-row items-center`}
                    >
                        <ChefHat size={14} color="#FFF" style={tw`mr-2`} />
                        <Typography variant="h3" color="#FFF" style={tw`text-xs`}>Cook This</Typography>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

import React, { useState } from 'react';
import { View, Image } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { Package, Check, X, AlertOctagon } from 'lucide-react-native';
import tw from '../../lib/tw';
import { Typography } from '../atoms/Typography';

interface RestockItem {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    image: string;
}

interface RestockSwiperProps {
    items: RestockItem[];
    onReorder: (item: RestockItem) => void;
    onIgnore: (item: RestockItem) => void;
}

export const RestockSwiper: React.FC<RestockSwiperProps> = ({ items, onReorder, onIgnore }) => {
    const [swipedAll, setSwipedAll] = useState(false);

    const renderCard = (card: any) => {
        if (!card) return null; // Handle empty card case if any

        return (
            <View style={tw`flex-1 rounded-2xl bg-zinc-800 border border-zinc-700 p-6 justify-center items-center shadow-lg relative`}>
                {/* Card Header Badge */}
                <View style={tw`absolute top-4 right-4 bg-red-500/20 px-3 py-1 rounded-full border border-red-500/30`}>
                    <Typography variant="tiny" color="#F87171" style={tw`font-bold`}>CRITICAL LOW</Typography>
                </View>

                {/* Content */}
                <View style={tw`w-32 h-32 bg-zinc-900 rounded-full items-center justify-center mb-6 border border-zinc-700 overflow-hidden`}>
                    {/* If simple emoji/string */}
                    {!card.image.startsWith('http') ? (
                        <Typography style={tw`text-6xl`}>{card.image}</Typography>
                    ) : (
                        <Image source={{ uri: card.image }} style={tw`w-full h-full`} resizeMode="cover" />
                    )}
                </View>

                <Typography variant="h1" color="#FFF" style={tw`text-center mb-2`}>{card.name}</Typography>

                <View style={tw`flex-row items-center bg-zinc-900 px-4 py-2 rounded-lg border border-zinc-700`}>
                    <AlertOctagon size={16} color="#FBBF24" style={tw`mr-2`} />
                    <Typography variant="body" color="#FBBF24" style={tw`font-bold`}>
                        Only {card.quantity} {card.unit} left
                    </Typography>
                </View>

                {/* Helper Text */}
                <View style={tw`absolute bottom-6 w-full flex-row justify-between px-6 opacity-50`}>
                    <View style={tw`flex-row items-center`}>
                        <X size={16} color="#F87171" />
                        <Typography variant="tiny" color="#F87171" style={tw`ml-1`}>Ignore</Typography>
                    </View>
                    <View style={tw`flex-row items-center`}>
                        <Typography variant="tiny" color="#4ADE80" style={tw`mr-1`}>Reorder</Typography>
                        <Check size={16} color="#4ADE80" />
                    </View>
                </View>
            </View>
        );
    };

    const handleSwipedRight = (cardIndex: number) => {
        if (items[cardIndex]) onReorder(items[cardIndex]);
    };

    const handleSwipedLeft = (cardIndex: number) => {
        if (items[cardIndex]) onIgnore(items[cardIndex]);
    };

    const onSwipedAllCards = () => {
        setSwipedAll(true);
    };

    if (!items || items.length === 0) {
        return (
            <View style={tw`h-[400px] justify-center items-center bg-zinc-900/50 rounded-2xl border border-zinc-800 m-4`}>
                <Check size={32} color="#4ADE80" />
                <Typography variant="h3" color="#FFF" style={tw`mt-4`}>All Stock Healthy</Typography>
                <Typography variant="caption" color="#A1A1AA" style={tw`text-center mt-2 px-10`}>
                    No items are running low.
                </Typography>
            </View>
        );
    }

    if (swipedAll) {
        return (
            <View style={tw`h-[400px] justify-center items-center bg-zinc-900/50 rounded-2xl border border-zinc-800 m-4`}>
                <View style={tw`bg-green-500/10 p-4 rounded-full mb-4`}>
                    <Check size={32} color="#4ADE80" />
                </View>
                <Typography variant="h3" color="#FFF">All Caught Up!</Typography>
                <Typography variant="caption" color="#A1A1AA" style={tw`text-center mt-2 px-10`}>
                    Inventory checks complete. No more critical items to review.
                </Typography>
            </View>
        );
    }

    return (
        <View style={tw`h-[420px] w-full mt-4`}>
            <Swiper
                cards={items}
                renderCard={renderCard}
                onSwipedRight={handleSwipedRight}
                onSwipedLeft={handleSwipedLeft}
                onSwipedAll={onSwipedAllCards}
                cardIndex={0}
                backgroundColor="transparent"
                stackSize={3}
                stackSeparation={15}
                overlayLabels={{
                    left: {
                        title: 'IGNORE',
                        style: {
                            label: {
                                backgroundColor: '#F87171',
                                borderColor: '#F87171',
                                color: 'white',
                                borderWidth: 1
                            },
                            wrapper: {
                                flexDirection: 'column',
                                alignItems: 'flex-end',
                                justifyContent: 'flex-start',
                                marginTop: 30,
                                marginLeft: -30
                            }
                        }
                    },
                    right: {
                        title: 'REORDER',
                        style: {
                            label: {
                                backgroundColor: '#4ADE80',
                                borderColor: '#4ADE80',
                                color: 'white',
                                borderWidth: 1
                            },
                            wrapper: {
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                justifyContent: 'flex-start',
                                marginTop: 30,
                                marginLeft: 30
                            }
                        }
                    }
                }}
                animateOverlayLabelsOpacity
                animateCardOpacity
                swipeBackCard
            />
        </View>
    );
};

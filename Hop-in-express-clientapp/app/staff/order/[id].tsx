import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { PickingSessionTemplate } from '../../../src/components/staff/PickingSessionTemplate';

export default function OrderPickingScreen() {
    const { id } = useLocalSearchParams();
    return <PickingSessionTemplate orderId={id as string} />;
}

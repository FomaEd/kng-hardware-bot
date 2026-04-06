function pickVisibleTurnTiltSet(height, width) {
        return hardwareMatrixVisibleTurnTilt.find(row =>
            height >= row.minHeight && height <= row.maxHeight &&
            width >= row.minWidth && width <= row.maxWidth
        );
    }

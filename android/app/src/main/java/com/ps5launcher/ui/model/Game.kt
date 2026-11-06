package com.ps5launcher.ui.model

data class Game(
    val id: String,
    val title: String,
    val platform: String,
    val boxArtUrl: String = "",
)
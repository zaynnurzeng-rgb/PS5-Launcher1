package com.ps5launcher.ui.components

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.LibraryBooks
import androidx.compose.material.icons.filled.Cloud
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.music.bitchord.ui.components.liquidGlass

data class BottomTab(val label: String, val icon: ImageVector)

val defaultTabs = listOf(
    BottomTab("Home", Icons.Filled.Home),
    BottomTab("Library", Icons.Filled.LibraryBooks),
    BottomTab("Cloud", Icons.Filled.Cloud),
    BottomTab("Settings", Icons.Filled.Settings),
)

@Composable
fun GlassBottomBar(
    tabs: List<BottomTab> = defaultTabs,
    selectedIndex: Int,
    onTabSelected: (Int) -> Unit,
    modifier: Modifier = Modifier,
) {
    val barShape = RoundedCornerShape(50)
    val density = LocalDensity.current
    val tabWidth = 72.dp
    val animatedOffset by animateFloatAsState(
        targetValue = selectedIndex * tabWidth.value,
        animationSpec = tween(durationMillis = 320),
        label = "pillOffset",
    )

    Box(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp, vertical = 12.dp)
            .clip(barShape)
            .liquidGlass(shape = barShape)
            .padding(horizontal = 8.dp, vertical = 8.dp),
    ) {
        // Travelling pill indicator
        Box(
            modifier = Modifier
                .offset(x = with(density) { animatedOffset.toDp() })
                .width(tabWidth)
                .height(56.dp)
                .clip(barShape)
                .background(Color.White.copy(alpha = 0.14f)),
        )
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceEvenly,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            tabs.forEachIndexed { index, tab ->
                Box(
                    modifier = Modifier
                        .width(tabWidth)
                        .height(56.dp)
                        .clickable { onTabSelected(index) },
                    contentAlignment = Alignment.Center,
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(
                            imageVector = tab.icon,
                            contentDescription = tab.label,
                            tint = if (index == selectedIndex) Color.White else Color.White.copy(alpha = 0.6f),
                            modifier = Modifier.size(22.dp),
                        )
                        Text(
                            text = tab.label,
                            color = if (index == selectedIndex) Color.White else Color.White.copy(alpha = 0.6f),
                            fontWeight = if (index == selectedIndex) FontWeight.Bold else FontWeight.Normal,
                            style = MaterialTheme.typography.labelSmall,
                        )
                    }
                }
            }
        }
    }
}
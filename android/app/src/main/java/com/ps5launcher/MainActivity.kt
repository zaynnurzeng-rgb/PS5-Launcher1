package com.ps5launcher

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.music.bitchord.ui.components.LocalAppBackdrop
import com.music.bitchord.ui.components.LocalLiquidGlassEnabled
import com.music.bitchord.ui.components.liquidGlass
import com.music.bitchord.ui.components.backdrop.backdrops.rememberLayerBackdrop

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme(colorScheme = darkColorScheme()) {
                Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
                    PS5LauncherApp()
                }
            }
        }
    }
}

@Composable
fun PS5LauncherApp() {
    val windowBackground = MaterialTheme.colorScheme.background
    val paintBackdrop: androidx.compose.ui.graphics.drawscope.ContentDrawScope.() -> Unit = remember(windowBackground) {
        {
            drawRect(windowBackground)
            drawContent()
        }
    }
    val appBackdrop = rememberLayerBackdrop(onDraw = paintBackdrop)

    CompositionLocalProvider(
        LocalLiquidGlassEnabled provides true,
        LocalAppBackdrop provides appBackdrop,
    ) {
        Column(Modifier.fillMaxSize()) {
            // Glass top bar
            val barShape = RoundedCornerShape(0.dp)
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(64.dp)
                    .liquidGlass(shape = barShape)
                    .padding(horizontal = 20.dp),
                contentAlignment = Alignment.CenterStart,
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = "PlayStation 5 Launcher",
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                    )
                    Spacer(Modifier.weight(1f))
                    Text(text = "9:41 AM", color = Color.White.copy(alpha = 0.8f))
                }
            }
            // Content
            Box(Modifier.fillMaxSize().padding(24.dp)) {
                Text("Liquid Glass demo (native Compose, BitChord-style)", color = Color.White)
            }
        }
    }
}
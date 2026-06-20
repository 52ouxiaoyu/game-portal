import re

with open("zombie-shooter/game.js", "r") as f:
    code = f.read()

# Remove gameOver() from Zombie collision
code = code.replace("""                if(players.every(p => (p.hp <= 0))) {
                    gameOver();
                }""", "")

# Add gameOver() check to the end of update()
update_end_code = """
    // Check Game Over condition safely
    if(players.every(p => (p.hp <= 0))) {
        gameOver();
    }
"""

code = code.replace("    barrels = barrels.filter(b => b.active && Math.hypot(b.x - camera.x, b.y - camera.y) < CANVAS_W * 3);", "    barrels = barrels.filter(b => b.active && Math.hypot(b.x - camera.x, b.y - camera.y) < CANVAS_W * 3);\n" + update_end_code)

with open("zombie-shooter/game.js", "w") as f:
    f.write(code)

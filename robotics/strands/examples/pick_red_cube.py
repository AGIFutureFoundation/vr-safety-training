"""The user's sample, made runnable here (simulated only).

The sample as pasted imported ``strands_harness.create_harness``. No ``strands_harness`` package exists (it is not
in strands-robots 0.3.8 and not on PyPI), so this repository provides its own ``create_harness``
(robotics/strands/harness.py) and a simulated robot with the same tool shape (robotics/strands/sim_robot.py).

Run from the repository root:

    python3 robotics/strands/examples/pick_red_cube.py

On real hardware, OUTSIDE this repository (not run here; strands-robots pulls in lerobot and torch), the same shape
would use the real tool and a policy server the owner runs:

    # pip install strands-robots               # Apache-2.0; needs lerobot, torch, strands-agents
    # from strands_robots import Robot
    # robot = Robot(tool_name="arm", robot="so100", port="/dev/ttyACM0")   # opens the serial port
    # robot.start_task("pick up the red cube", policy_port=5555, policy_host="localhost", policy_provider="<provider>")
    # A Strands Agent driving the tool by language would also need a model provider and its credentials.
    # Here, SimRobot(..., port=...) is refused by the governor ("physical-target").
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[3]))

from robotics.strands.harness import create_harness  # noqa: E402
from robotics.strands.sim_robot import SimRobot  # noqa: E402

create_harness(tools=[SimRobot("so100")])("pick up the red cube")

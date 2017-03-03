import serial.tools.list_ports
import json
import threading

#Class for threads that listen to the thermocycler for updates
class ThermocyclerListener(threading.Thread):
    def __init__(self, port):
        threading.Thread.__init__(self)
        self.port = port

    #Override
    def run(self):
        while True:
            print(self.port.readline())



# Lock to prevent race conditions on port dictionary and
# the device ID generator.
lock = threading.Lock()

# This is the dictionary of all the
# ports that the user has subscribed to.
# Key = ID that the user uses to refer to it
# Value = The port
# Note: This data structure should only be accessed
# when it is inside a lock.
id_with_port_dictionary = {}

# Dictionary to store the most recent state of the device.
# The status value will contain the following information
# CURRENT_STATE : "IDLE", "DENATURATION", "RAMPING_UP", "COOLING_DOWN", "UPPER_MAINTAIN" or "LOWER_MAINTAIN"
# CURRENT_CYCLE : the current cycle the process is on
# CURRENT_TIME  : the time elapsed on the current process
id_with_most_recent_state_dictionary = {}

# This is the counter used to generate the ID that the user can use to access the port.
deviceIdCounter = 0


# Returns a JSON object in the form:
# {devices: [device1, device2...]}
# where "device" is the serial port
# that is available for connection.
# Example for Windows: {devices : ["COM3", "COM4"]}
def getPorts():
    list_of_devices = []
    for port_data in serial.tools.list_ports.comports():
        list_of_devices.append(port_data.device)
        print str(list_of_devices)
    return json.dumps({'devices' : list_of_devices})

# Connects to port p, a string representation of the port to connect to. Example: "COM4"
# Returns the ID of the port to refer to it in the future.
def connectToPort(p):
    lock.acquire()
    deviceId = ++deviceIdCounter
    port = serial.Serial(p)
    id_with_port_dictionary[deviceId] = port
    lock.release()
    return deviceId

# ID is the ID that was given to the client for a particular device
# Settings is a JSON object with the following format:
# {
#  "DENATURATION": <true/false>,
#  "FLOOR_TEMP": <a number in celsius>,
#  "CEILING_TEMP": <a number in celsius>,
#  "TIME_FOR_MAINTAIN": <an int in seconds>,
#  "NUM_CYCLES": <an int in cycles>
# }
def startThermocycler(id, settings):
    lock.acquire()
    port = id_with_port_dictionary[id]
    lock.release()
    setting_values = json.loads(settings)
    port.write(str(setting_values["DENATURATION"]) + "\n")
    port.write(str(setting_values["FLOOR_TEMP"]) + "\n")
    port.write(str(setting_values["CEILING_TEMP"]) + "\n")
    port.write(str(setting_values["TIME_FOR_MAINTAIN"]) + "\n")
    port.write(str(setting_values["NUM_CYCLES"]) + "\n")
    port.write("START\n")
    listener = ThermocyclerListener(port)
    listener.start()

# ID is the ID that was given to the client for a particular device
# Function will return a JSON object with the following data points:
#{
# CURRENT_STATE : "IDLE", "DENATURATION", "RAMPING_UP", "COOLING_DOWN", "UPPER_MAINTAIN" or "LOWER_MAINTAIN"
# (only one of these will be assigned to CURRENT_STATE).
# CURRENT_CYCLE : the current cycle the process is on
# CURRENT_TIME  : the time elapsed on the current process
#}
def getStatus(id):
    lock.acquire()
    status = id_with_most_recent_state_dictionary[id]
    lock.release()
    return json.dumps(status)

# ID is the ID that was given to the client for a particular device
def restartThermocycler(id):
    lock.acquire()
    port = id_with_port_dictionary[id]
    lock.release()
    port.write("RESTART\n")

# ID is the ID that was given to the client for a particular device
def pauseThermocycler(id):
    lock.acquire()
    port = id_with_port_dictionary[id]
    lock.release()
    port.write("PAUSE\n")

# ID is the ID that was given to the client for a particular device
def resumeThermocycler(id):
    lock.acquire()
    port = id_with_port_dictionary[id]
    lock.release()
    port.write("RESUME\n")



















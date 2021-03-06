## Imports
# the flask application we're testing
import pdf_server
# unittest package
import unittest
# os file and pathing utilities
from os import path, mkdir, unlink, write, close, path as path
# temp file creation
from tempfile import mkstemp
# file comparing tool
import filecmp
##

class TownProfileTest(unittest.TestCase):
    def setUp(self):
        # test client setup
        # application setup
        pdf_server.app.config["TESTING"] = True
        self.app = pdf_server.app.test_client()
        self.tempFiles = []
        # if temp directory doesn't exist, create one.
        if not path.isdir("temp"):
            mkdir("temp")


    def tearDown(self):
        # Remove temp files from tests
        for tempFile in self.tempFiles:
            unlink(tempFile)

    def test_town_profile(self):
        # Get file path to testing standard
        standardFile = path.abspath("static/tests/Hartford.pdf")

        # Get Town profile mock request from file.
        townProfileMock = open("static/tests/Hartford.json")
        townProfileMock = townProfileMock.read()

        # Get response to simulated request
        res = self.app.post('/download', data = {"data" : townProfileMock})

        # Create temporary file, get handle and path
        tempHandle, tempFile = mkstemp(dir="temp")
        # store path in list of temp paths to remove later.
        self.tempFiles.append(tempFile)
        # Write request response to temp file
        write(tempHandle, res.data)
        # Close temp file handle
        close(tempHandle)
        # Assert tempfile is the same as current testing standard
        assert filecmp.cmp(tempFile, standardFile), "Town Profile does not match Standard!"

class ConnectTest(unittest.TestCase):
    def setUp(self):
        # test client setup
        # application setup
        pdf_server.app.config["TESTING"] = True
        self.app = pdf_server.app.test_client()
        self.tempFiles = []
        # if temp directory doesn't exist, create one.
        if not path.isdir("temp"):
            mkdir("temp")


    def tearDown(self):
        # Remove temp files from tests
        for tempFile in self.tempFiles:
            unlink(tempFile)

    def test_connect(self):
        # Get file path to testing standard
        standardFile = path.abspath("static/tests/statewide_connect_report.pdf")

        # Get Town profile mock request from file.
        connectMock = open("static/tests/statewide_connect_report.json")
        connectMock = connectMock.read()

        # Get response to simulated request
        res = self.app.post('/download', data = {"data" : connectMock})

        # Create temporary file, get handle and path
        tempHandle, tempFile = mkstemp(dir="temp")
        # store path in list of temp paths to remove later.
        self.tempFiles.append(tempFile)
        # Write request response to temp file
        write(tempHandle, res.data)
        # Close temp file handle
        close(tempHandle)
        # Assert tempfile is the same as current testing standard
        assert filecmp.cmp(tempFile, standardFile), "CONNECT Report does not match Standard!"

if __name__ == "__main__":
    unittest.main()
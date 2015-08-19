import os
import pdf_server
import unittest
import filecmp
from tempfile import mkstemp

class TownProfileTest(unittest.TestCase):
    def setUp(self):
        # test client setup
        pdf_server.app.config["TESTING"] = True
        self.app = pdf_server.app.test_client()
        self.tempFiles = []

    def tearDown(self):
        for tempFile in self.tempFiles:
            os.unlink(tempFile)
        #more stuff

    def test_post(self):
        # Get file path to testing standard
        standardFile = os.path.abspath("static/tests/town_profile.pdf")
        print(standardFile)

        # Get response to simulated request
        res = self.app.get('/download', query_string = {"print" : 1})

        # Create temporary file, get handle and path
        tempHandle, tempFile = mkstemp(dir="temp")
        # store path in list of temp paths to remove later.
        self.tempFiles.append(tempFile)
        # Write request response to temp file
        os.write(tempHandle, res.data)
        # Close temp file handle
        os.close(tempHandle)
        # Assert tempfile is the same as current testing standard
        assert filecmp.cmp(tempFile, standardFile), "Town Profile does not match Standard!"


if __name__ == "__main__":
    unittest.main()
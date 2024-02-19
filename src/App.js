import React, { useState, useEffect } from 'react';
import { database } from './firebase'; // Remove storageRef since audio upload is removed
import {
  Box,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Button,
  Typography,
} from '@mui/material';
import styled from '@emotion/styled';
import { saveAs } from 'file-saver';
import './App.css';

const StyledContainer = styled(Box)`
  background-color: #f2e0c8; /* Light straw color */
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 20px auto;
  max-width: 800px;
  border-radius: 10px; /* Softer edges */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); /* Subtle shadow */

  /* Background texture for a more natural look */
  background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAC1HAwCAAAAC0lEQVR4nGNiYAAAAAYAAjCB0C8AAAAASUVORK5CYII=");
  background-size: 10px;
  background-repeat: repeat;

  /* Add a beehive image in the top right corner */
  background-image: url('./images/beehive.png'); /* Adjusted path! */
  background-position: top right;
  background-repeat: no-repeat;
`;

const StyledHeading = styled(Typography)`
  font-size: 24px;
  color: #663300; /* Browner, less gray heading */
  margin-bottom: 20px;
`;

const StyledSubheading = styled(Typography)`
  font-size: 18px;
  color: #805933; /* Browner, less gray subheading */
  margin-bottom: 10px;
`;

// ... rest of your component code
function App() {
  const [text, setText] = useState('');
  const [uploads, setUploads] = useState([]); // Initialize as an empty array
  const [searchTerm, setSearchTerm] = useState(''); // Add initial value for searchTerm

  // Fetch text uploads on component mount
  useEffect(() => {
    const fetchData = async () => {
      const snapshot = await database.ref('uploads/text').orderByChild('createdAt').limitToLast(10).get();
      const data = snapshot.val();

      // Handle potential null/undefined data
      const sortedData = data ? Object.entries(data).reverse().map(([key, value]) => ({ key, ...value })) : [];
      setUploads(sortedData);
    };
    fetchData();
  }, []);

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const handleUpload = async () => {
    if (text) {
      const timestamp = Date.now(); // Add timestamp for sorting
      await database.ref('uploads/text').push().set({ text, createdAt: timestamp });
      setText('');
      alert('Text uploaded successfully!');
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Access filteredUploads within the component body, not outside
  const filteredUploads = uploads.filter((upload) =>
    upload.text && upload.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownload = async (upload) => {
    try {
      if (!upload.text) {
        console.error("Missing text data for download.");
        return;
      }

      const textToDownload = upload.text;
      const blob = new Blob([textToDownload], { type: 'text/plain' });
      saveAs(blob, `text-${upload.key}.txt`);
    } catch (error) {
      console.error('Error downloading text:', error);
      alert('Failed to download text. Please try again.');
    }
  };

  const readText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "pt-BR"; // Adjust language as needed
      speechSynthesis.speak(utterance);
    } else {
      console.error("Speech Synthesis not supported by your browser.");
    }
  };


  return (
    <StyledContainer>
      <StyledHeading>Welcome to the Hive Archives</StyledHeading>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <StyledSubheading>Search uploaded texts</StyledSubheading>
          <TextField
            fullWidth
            label="Search"
            value={searchTerm}
            onChange={handleSearch}
            size="small"
            sx={{ marginBottom: 2 }} // Add custom margin for spacing
          />
        </Grid>
      </Grid>

      <TableContainer>
        <Table aria-label="uploaded texts">
          <TableHead>
            <TableRow>
              <TableCell>&#35;</TableCell>
              <TableCell>Text</TableCell>
              <TableCell>Uploaded At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUploads.map((upload, index) => (
              <TableRow key={upload.key}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{upload.text}</TableCell>
                <TableCell>{new Date(upload.createdAt).toLocaleString()}</TableCell>
                <TableCell>
                  <Button variant="contained" onClick={() => handleDownload(upload)}>
                    Download
                  </Button>
                </TableCell>
                <TableCell>
                  <Button variant="contained" onClick={() => readText(upload.text)}>
                    Read
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredUploads.length === 0 && <p>No uploaded texts matching your search.</p>}

      <Box sx={{ marginTop: 20 }}>
        <StyledSubheading>Upload Text</StyledSubheading>
        <TextField
          fullWidth
          label="Enter text to upload"
          value={text}
          onChange={handleTextChange}
          multiline
          rows={3} // Reduce the number of rows for a smaller text field
          size="small"
          sx={{ marginBottom: 2 }} // Add custom margin for spacing
        />
        <Button variant="contained" onClick={handleUpload}>
          Upload
        </Button>
      </Box>
    </StyledContainer>
  );
}

export default App;

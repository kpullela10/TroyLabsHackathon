import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import {
  CssBaseline,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  TextField,
  Button,
  Box,
  AppBar,
  Toolbar,
} from "@mui/material";
import { motion } from "framer-motion";

const API_URL = "http://localhost:8001/api";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#7C3AED",
    },
    secondary: {
      main: "#10B981",
    },
    background: {
      default: "#111827",
      paper: "#1F2937",
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

const Dashboard = () => {
  const [featureImportance, setFeatureImportance] = useState([]);
  const [userSegments, setUserSegments] = useState([]);
  const [retentionRates, setRetentionRates] = useState([]);
  const [topFeatures, setTopFeatures] = useState([]);
  const [conversionSuggestion, setConversionSuggestion] = useState("");
  const [apiKey, setApiKey] = useState("");

  const fetchData = async () => {
    try {
      await fetch(`${API_URL}/fetch_data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ api_key: apiKey }),
      });

      const featureResp = await fetch(`${API_URL}/feature_importance`);
      const featureData = await featureResp.json();
      setFeatureImportance(
        Object.entries(featureData).map(([name, value]) => ({ name, value }))
      );

      const segmentsResp = await fetch(`${API_URL}/user_segments`);
      const segmentsData = await segmentsResp.json();
      setUserSegments(
        Object.entries(segmentsData).map(([segment, data]) => ({
          segment,
          ...data,
        }))
      );

      const retentionResp = await fetch(`${API_URL}/retention_rates`);
      const retentionData = await retentionResp.json();
      setRetentionRates(
        Object.entries(retentionData).map(([cohort, rate]) => ({
          cohort,
          rate,
        }))
      );

      const topFeaturesResp = await fetch(`${API_URL}/top_features`);
      const topFeaturesData = await topFeaturesResp.json();
      setTopFeatures(topFeaturesData.top_features);
      setConversionSuggestion(topFeaturesData.suggestion);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApiKeySubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" color="transparent" elevation={0}>
          <Toolbar sx={{ flexDirection: "column", alignItems: "center" }}>
            <Typography
              variant="h4"
              component="div"
              sx={{ fontWeight: "bold" }}
            >
              Wizard
            </Typography>
            <Typography variant="subtitle1" sx={{ fontStyle: "italic" }}>
              Learn Your Customer
            </Typography>
          </Toolbar>
        </AppBar>
        <Box sx={{ p: 3 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card sx={{ mb: 3, bgcolor: "background.paper" }}>
              <CardContent>
                <form onSubmit={handleApiKeySubmit}>
                  <TextField
                    label="Mixpanel API Key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                  >
                    Fetch Data
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card sx={{ mb: 3, bgcolor: "background.paper" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Top Features for User Conversion
                </Typography>
                <Typography variant="body1" paragraph>
                  {conversionSuggestion}
                </Typography>
                <Grid container spacing={2}>
                  {topFeatures.map(([feature, importance], index) => (
                    <Grid item xs={12} sm={4} key={index}>
                      <Paper
                        elevation={3}
                        sx={{ p: 2, bgcolor: "background.default" }}
                      >
                        <Typography variant="subtitle1">
                          {index + 1}. {feature.replace(/_/g, " ")}
                        </Typography>
                        <Typography variant="body2">
                          Importance: {(importance * 100).toFixed(2)}%
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card sx={{ mb: 3, bgcolor: "background.paper" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Feature Importance
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={featureImportance}>
                    <XAxis
                      dataKey="name"
                      tickFormatter={(value) => value.replace(/_/g, " ")}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#7C3AED" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card sx={{ mb: 3, bgcolor: "background.paper" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  User Segments
                </Typography>
                <Grid container spacing={2}>
                  {userSegments.map((segment, index) => (
                    <Grid item xs={12} sm={4} key={index}>
                      <Paper
                        elevation={3}
                        sx={{ p: 2, bgcolor: "background.default" }}
                      >
                        <Typography variant="subtitle1">
                          Segment {segment.segment}
                        </Typography>
                        <ul>
                          {Object.entries(segment).map(
                            ([key, value]) =>
                              key !== "segment" && (
                                <li key={key}>
                                  <Typography variant="body2">
                                    {key.replace(/_/g, " ")}:{" "}
                                    {Number(value).toFixed(2)}
                                  </Typography>
                                </li>
                              )
                          )}
                        </ul>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Card sx={{ bgcolor: "background.paper" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Retention Rates
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={retentionRates}>
                    <XAxis dataKey="cohort" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="rate" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Dashboard;

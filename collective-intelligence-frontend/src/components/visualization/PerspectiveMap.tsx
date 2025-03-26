// src/components/visualization/PerspectiveMap.tsx
import React, { useEffect, useState, useRef } from 'react';
import { analysisApi } from '../../services/api';  // Use the API service
import * as d3 from 'd3';

interface PerspectiveMapProps {
  discussionId: string;
}

interface MessageAnalysis {
  id: string;
  message_id: string;
  sentiment_score: number;
  perspective_vector: {
    dimensions: string[];
    values: number[];
  };
  analyzed_at: string;
}

interface PerspectivePoint {
  x: number;
  y: number;
  message_id: string;
  sentiment: number;
}

const PerspectiveMap: React.FC<PerspectiveMapProps> = ({ discussionId }) => {
  const [analyses, setAnalyses] = useState<MessageAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const fetchAnalyses = async () => {
      setIsLoading(true);
      try {
        // Use the API service instead of direct axios
        const response = await analysisApi.getDiscussionAnalysis(discussionId);
        setAnalyses(response.data.analyses || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch analyses');
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchAnalyses();
  }, [discussionId]);

  useEffect(() => {
    if (!isLoading && analyses.length > 0 && svgRef.current) {
      createVisualization();
    }
  }, [isLoading, analyses]);

  const createVisualization = () => {
    if (!svgRef.current) return;

    // Clear previous visualization
    d3.select(svgRef.current).selectAll('*').remove();

    // Map analyses to 2D points (using first two dimensions for simplicity)
    const points: PerspectivePoint[] = analyses
      .filter(a => a.perspective_vector && a.perspective_vector.values.length >= 2)
      .map(a => ({
        x: a.perspective_vector.values[0],
        y: a.perspective_vector.values[1],
        message_id: a.message_id,
        sentiment: a.sentiment_score
      }));

    if (points.length === 0) return;

    // Set up SVG
    const width = 250;
    const height = 200;
    const margin = { top: 10, right: 10, bottom: 30, left: 30 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([0, 1])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, 1])
      .range([innerHeight, 0]);

    // Add axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(5).tickFormat(d3.format('.1f')));

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(d3.format('.1f')));

    // Add points
    g.selectAll('circle')
      .data(points)
      .enter()
      .append('circle')
      .attr('cx', (d: PerspectivePoint) => xScale(d.x))
      .attr('cy', (d: PerspectivePoint) => yScale(d.y))
      .attr('r', 5)
      .attr('fill', (d: PerspectivePoint) => {
        // Using d3 color interpolation
        const normalizedSentiment = (d.sentiment + 1) / 2; // Convert from [-1,1] to [0,1]
        return d3.interpolateRdYlGn(normalizedSentiment);
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .append('title')
      .text((d: PerspectivePoint) => `Message ${d.message_id.substring(0, 8)}...\nSentiment: ${d.sentiment.toFixed(2)}`);

    // Add axis labels
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + margin.bottom - 5)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .text('Factual ↔ Emotional');

    g.append('text')
      .attr('x', -innerHeight / 2)
      .attr('y', -margin.left + 10)
      .attr('transform', 'rotate(-90)')
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .text('Logical ↔ Intuitive');
  };

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <div className="animate-pulse h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
        <div className="animate-pulse h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-500 py-2">{error}</div>
    );
  }

  return (
    <div>
      <h3 className="text-md font-medium text-gray-700 mb-2">Perspective Map</h3>
      {analyses.length === 0 ? (
        <p className="text-sm text-gray-500">No data available for visualization.</p>
      ) : (
        <div className="bg-gray-50 p-3 rounded">
          <svg ref={svgRef} width="250" height="200"></svg>
          <div className="mt-2 text-xs text-gray-500">
            <p>This visualization maps messages based on their perspective dimensions.</p>
            <p>Colors represent sentiment (red=negative, green=positive).</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerspectiveMap;
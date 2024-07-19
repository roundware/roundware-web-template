import { Paper, ThemeProvider } from '@mui/material';
import { Feature, FeatureCollection, LineString, MultiLineString, Point, point } from '@turf/helpers';
import pointToLine from '@turf/point-to-line-distance';
import polygonToLineString from '@turf/polygon-to-line';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon'
import { useRoundware } from 'hooks';
import { isNumber } from 'lodash';
import { useMemo } from 'react';
import { lightTheme } from 'styles';

type Props = {}
export const normalizeCoords = (coordinates: number[]) => {
    for (let i = 0; i < coordinates.length; i++) {
        if (coordinates[i] > 180) coordinates[i] = (coordinates[i] % 180) - 180;
        else if (coordinates[i] < -180)
            coordinates[i] = (coordinates[i] % 180) + 180;
    }
    return coordinates;
};

/**
 * @param  {number} {latitude
 * @param  {number} longitude
 * @returns Feature<Point>
 */
export function coordsToPoints({
    latitude,
    longitude,
}: {
    latitude: number;
    longitude: number;
}): Feature<Point> {
    // shreyas - we need make sure coordinate lies within range of 180 to -180
    return point(normalizeCoords([+longitude, +latitude])); // NOTE we need to reverse the order here to make geolocations compatible with Roundware geometries, which have points listed w/ longitude first
}

const OutOfRangeMessage = (props: Props) => {

    const { roundware } = useRoundware();

    const show = useMemo(() => {
        if (!roundware.project.data?.out_of_range_message || !isNumber(roundware.project.outOfRangeDistance)) {
            return false;
        }

        const listenerPoint = roundware.mixer?.mixParams?.listenerPoint;

        // if we don't have a listener location, we can't show the message
        if (!listenerPoint) {
            return false;
        }



        // if we are in range, we don't need to show the message
        if (roundware.project.outOfRangeDistance <= 0) {
            return false;
        }




        // check if listener is in range of any speaker
        if (roundware.speakers().some((speaker) => {
            if (!speaker.shape) {
                return false;
            }
            return booleanPointInPolygon(listenerPoint, speaker.shape);
        })) {
            return false;
        }


        const lines: LineString[] = [];



        roundware.speakers().forEach((speaker) => {
            if (speaker.shape) {
                const polygonLines = polygonToLineString(speaker.shape) as FeatureCollection<LineString | MultiLineString> | LineString | MultiLineString;
                if (polygonLines.type === 'FeatureCollection') {
                    polygonLines.features.forEach((line) => {
                        if (line.geometry.type === 'LineString') {
                            lines.push(line.geometry);
                        } else if (line.geometry.type === 'MultiLineString') {
                            line.geometry.coordinates.forEach((coord) => {
                                lines.push({ type: 'LineString', coordinates: coord });
                            });
                        }
                    });
                }

                if (polygonLines.type === 'LineString') {
                    lines.push(polygonLines);
                };

                if (polygonLines.type === 'MultiLineString') {
                    polygonLines.coordinates.forEach((coord) => {
                        lines.push({ type: 'LineString', coordinates: coord });
                    });
                }
            }
        });




        const distances = lines.map((line) => pointToLine(listenerPoint, line, {
            units: 'meters'
        }));



        if (distances.length === 0) {
            return false;
        }

        const minDistance = Math.min(...distances);
        console.log('minDistance', minDistance, roundware.project.outOfRangeDistance);
        if (minDistance < roundware.project.outOfRangeDistance) {
            return false;
        }




        return true;
    }, [roundware.project.data?.out_of_range_message, roundware.project.outOfRangeDistance, roundware.listenerLocation, roundware.speakers()]);

    if (show) {

        return (
            <ThemeProvider theme={lightTheme}>
                <Paper sx={{
                    position: 'absolute',
                    top: '10%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1000,
                    p: 2,
                    borderRadius: 2

                }}
                    variant='elevation'
                    elevation={8}
                >


                    {roundware.project.data?.out_of_range_message}
                </Paper>
            </ThemeProvider>)
    }
    return null;
}

export default OutOfRangeMessage
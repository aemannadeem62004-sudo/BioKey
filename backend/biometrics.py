from typing import List, Dict
from collections import defaultdict
import numpy as np

class KeystrokeAnalyzer:

    @staticmethod
    def calculate_dwell_times(keystrokes: List[Dict]) -> Dict[str, List[float]]:
        """
        Calculates Dwell Time (DT): Duration a key is held down (KeyRelease - KeyPress)
        """
        dwells = defaultdict(list)
        press_times = {}
        
        for event in keystrokes:
            key = event.get('key')
            type_ = event.get('type')  # 'keydown' or 'keyup'
            time_ = event.get('timestamp')
            
            if not key or time_ is None:
                continue
                
            if type_ == 'keydown':
                press_times[key] = time_
            elif type_ == 'keyup' and key in press_times:
                dt = time_ - press_times[key]
                dwells[key].append(dt)
                del press_times[key]
        return dwells

    @staticmethod
    def calculate_flight_times(keystrokes: List[Dict]) -> Dict[str, List[float]]:
        """
        Calculates Flight Time (FT): Duration between consecutive keys (KeyPress_n - KeyRelease_n-1)
        """
        flights = defaultdict(list)
        last_release_time = None
        last_key = None
        
        for event in keystrokes:
            key = event.get('key')
            type_ = event.get('type')
            time_ = event.get('timestamp')
            
            if not key or time_ is None:
                continue
                
            if type_ == 'keydown':
                if last_release_time is not None and last_key is not None:
                    ft = time_ - last_release_time
                    pair = f"{last_key}-{key}"
                    flights[pair].append(ft)
            elif type_ == 'keyup':
                last_release_time = time_
                last_key = key
        return flights

    @staticmethod
    def compute_statistics(time_dict: Dict[str, List[float]]) -> tuple:
        """
        Computes the Arithmetic Mean (μ) and Standard Deviation (σ) vectors
        """
        means = {}
        stddevs = {}
        
        for key, times in time_dict.items():
            if times:
                means[key] = float(np.mean(times))
                stddevs[key] = float(np.std(times)) if len(times) > 1 else 0.1
        return means, stddevs

    @staticmethod
    def extract_profile_from_repetitions(repetitions: List[List[Dict]]) -> Dict:
        """
        Used during ENROLLMENT. Returns raw dictionaries of averages 
        so app.py can map them into Pydantic models.
        """
        all_dwell_times = defaultdict(list)
        all_flight_times = defaultdict(list)
        
        for keystrokes in repetitions:
            dwell_times = KeystrokeAnalyzer.calculate_dwell_times(keystrokes)
            flight_times = KeystrokeAnalyzer.calculate_flight_times(keystrokes)
            
            for key, times in dwell_times.items():
                all_dwell_times[key].extend(times)
            
            for pair, times in flight_times.items():
                all_flight_times[pair].extend(times)
        
        dwell_means, dwell_stddevs = KeystrokeAnalyzer.compute_statistics(all_dwell_times)
        flight_means, flight_stddevs = KeystrokeAnalyzer.compute_statistics(all_flight_times)
        
        return {
            'dwell_means': dwell_means,
            'dwell_stddevs': dwell_stddevs,
            'flight_means': flight_means,
            'flight_stddevs': flight_stddevs
        }

    @staticmethod
    def extract_live_profile(keystrokes: List[Dict]) -> Dict:
        """
        Used during LOGIN. Extracts a single-pass mean profile from the login attempt.
        """
        dwell_times = KeystrokeAnalyzer.calculate_dwell_times(keystrokes)
        flight_times = KeystrokeAnalyzer.calculate_flight_times(keystrokes)
        
        # Take averages for the single login sample phrase
        dwell_means = {k: float(np.mean(v)) for k, v in dwell_times.items() if v}
        flight_means = {k: float(np.mean(v)) for k, v in flight_times.items() if v}
        
        return {
            'dwell_means': dwell_means,
            'flight_means': flight_means
        }

    @staticmethod
    def compute_similarity_score(live_profile: Dict, baseline_profile: Dict) -> float:
        """
        Calculates a simple Manhattan/Euclidean distance-based similarity score (0.0 to 1.0)
        between the live typing attempt and the database baseline profile.
        """
        scores = []
        
        # 1. Compare Dwell Times
        live_dwell = live_profile.get('dwell_means', {})
        base_dwell = baseline_profile.get('dwell_means', {})
        
        dwell_diffs = []
        for key in live_dwell:
            if key in base_dwell and base_dwell[key] > 0:
                # Relative difference percentage calculation
                diff = abs(live_dwell[key] - base_dwell[key]) / base_dwell[key]
                dwell_diffs.append(diff)
                
        if dwell_diffs:
            # Convert error rate to similarity score component
            scores.append(max(0.0, 1.0 - np.mean(dwell_diffs)))

        # 2. Compare Flight Times
        live_flight = live_profile.get('flight_means', {})
        base_flight = baseline_profile.get('flight_means', {})
        
        flight_diffs = []
        for pair in live_flight:
            if pair in base_flight and base_flight[pair] > 0:
                diff = abs(live_flight[pair] - base_flight[pair]) / base_flight[pair]
                flight_diffs.append(diff)
                
        if flight_diffs:
            scores.append(max(0.0, 1.0 - np.mean(flight_diffs)))

        # Return average similarity score across parameters (Default fallback 0.0 if zero overlap)
        return float(np.mean(scores)) if scores else 0.0
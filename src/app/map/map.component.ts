import { Component, AfterViewInit, ViewChild, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs';

interface loc { 
  lat: number,
  lng: number
}

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
   
export class MapComponent implements AfterViewInit {
  @ViewChild('mapContainer') gmap: ElementRef;
  
  apiLoaded: Observable<boolean>;
  locationString: string;
  results = [];
  error;
  service;
  map:google.maps.Map;
  infowindow: google.maps.InfoWindow;
  loadingResults = false;

  constructor(private cdr: ChangeDetectorRef)  {}

  ngAfterViewInit(): void {
    const origin = new google.maps.LatLng(34.052, -118.243);
    this.infowindow = new google.maps.InfoWindow();
    this.map = new google.maps.Map(
      this.gmap.nativeElement, { center: origin, zoom: 15 });
  }

  onKey(value: string) {
    this.locationString = value;
  }

  async search() {
    this.loadingResults = true;
    this.cdr.detach();
    const geocoder = new google.maps.Geocoder();
    const loc = await this.codeAddress(geocoder) as loc;
    const userDefinedLocation = new google.maps.LatLng(loc.lat, loc.lng);

    const request = {
      location: userDefinedLocation,
      radius: 500,
      type: 'restaurant'
    };
    
    const place = new google.maps.places.PlacesService(this.map);

    place.nearbySearch(request, function (results, status) {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        this.results = [...results];
        this.loadingResults = false;
        this.cdr.detectChanges();
        for (let i = 0; i < results.length; i++) {
          this.createMarker(results[i]);
        }
        this.map.setCenter(results[0].geometry.location);
        this.cdr.reattach();
      }
    }.bind(this));
  }

  createMarker(place: google.maps.places.PlaceResult) {
    const marker = new google.maps.Marker({
      map: this.map,
      position: (place.geometry as google.maps.places.PlaceGeometry).location
    });
  
    google.maps.event.addListener(marker, "click", () => {
      this.infowindow.setContent(`
      <div>
        <div>
          <h3>${place.name} <span><img width="16" src="${place.icon}"/></span> <span class="rating">${place.rating || ''}</span></h3>
          <div>${place.vicinity}</div>
        </div>
      </div>
      `);
      this.infowindow.open(this.map, marker);
    });
  }

  codeAddress(geocoder) {
    return new Promise((resolve, reject) => { 
      geocoder.geocode( { 'address': this.locationString}, function(results, status) {
        if (status == 'OK') {
          const lat = results[0].geometry.location.lat();
          const lng = results[0].geometry.location.lng();
          resolve({lat, lng})
        } else {
          const err = 'Geocode was not successful for the following reason: ' + status
          reject(err)
        }
      });
    })
  }

}

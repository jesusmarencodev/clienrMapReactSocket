import { useRef, useState,useEffect, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { v4 } from 'uuid';
import { Subject } from 'rxjs';

mapboxgl.accessToken = 'pk.eyJ1IjoiamVzdXNtYXJlbmNvZGV2IiwiYSI6ImNrbmo0a3J4czBmancycHFsajJia3dweHAifQ.eqkB4R6c8NK539EShv4B8A';

export const useMapbox = ( puntoInicial ) => {

  //Referencia al DIV del mapa
  const mapDiv = useRef();
  const setRef = useCallback((node)=>{
    mapDiv.current = node
  },[]);

  //Referencia a los marcadores
  const marcadores = useRef({});

  //observables de RXJs
  const movimientoMarcador = useRef(new Subject());;
  const nuevoMarcador = useRef(new Subject());

  //Mapa y Coords
  const mapa = useRef();
  const [coords, setCoords] = useState(puntoInicial);


  //funcion para agregar marcadores
  const agregarMarcador = useCallback((ev, id)=>{
    const { lat, lng } = ev.lngLat || ev;
    const marker = new mapboxgl.Marker();
    marker.id = id || v4();

    marker
      .setLngLat([lng, lat])
      .addTo(mapa.current)
      .setDraggable(true)

    marcadores.current[ marker.id ] = marker;

    if(!id){
      nuevoMarcador.current.next({
        id : marker.id,
        lng,
        lat
      });
    }


    //escuchar movimientos del marcador
    marker.on('drag', ({target})=>{
      const { id } = target;
      const { lng, lat } = target.getLngLat();
      movimientoMarcador.current.next({ id, lng, lat });

    });

  },[]);

  //funcion para actualizar la ubicacion del marcador
  const actualizarPosicion = useCallback(({id, lng, lat})=>{
    marcadores.current[id].setLngLat([lng, lat]);
  },[]);



  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapDiv.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center:[puntoInicial.lng, puntoInicial.lat], 
      zoom: puntoInicial.zoom
    });
    mapa.current = map;
  }, [puntoInicial]);

  //cuando se mueve el mapa
  useEffect(() => {
    mapa.current?.on('move', ()=>{
      const { lng, lat } = mapa.current.getCenter();
      setCoords({
        lng : lng.toFixed(4),
        lat :lat.toFixed(4),
        zoom: mapa.current.getZoom().toFixed(2)
      })
    });

  }, []);

  //aggregar marcadores cuando hacemos click
  useEffect(() => {
    mapa.current?.on('click', (ev)=>{
      agregarMarcador(ev);
    })
  }, [agregarMarcador]);


  return {
    agregarMarcador,
    actualizarPosicion,
    coords,
    marcadores,
    setRef,
    nuevoMarcador$: nuevoMarcador.current,
    movimientoMarcador$:movimientoMarcador.current
  }

}

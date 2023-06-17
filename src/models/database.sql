

DROP TABLE IF EXISTS public.properties;

CREATE TABLE IF NOT EXISTS public.properties
(
    id serial,
    listed_by integer NOT NULL,
    title character varying(100) COLLATE pg_catalog."default",
    category character varying(100) COLLATE pg_catalog."default",
    address text COLLATE pg_catalog."default" NOT NULL,
    country character varying(30) COLLATE pg_catalog."default",
    state character varying(30) COLLATE pg_catalog."default",
    lga character varying(50) COLLATE pg_catalog."default",
    district character varying(30) COLLATE pg_catalog."default",
    size character varying(10) COLLATE pg_catalog."default",
    bedrooms integer,
    bathrooms integer,
    year_built integer,
    price numeric(10,2) DEFAULT NULL,
	rent_cost numeric(10,2) DEFAULT NULL,
    is_for property_is_for NOT NULL,
	floor_area character varying(30),
	no_of_floors character varying(30),
    property_type character varying(30) COLLATE pg_catalog."default",
    description character varying(30) COLLATE pg_catalog."default",
	amenities character varying(30) DEFAULT NULL,
	rent_frequency  character varying(30) DEFAULT NULL,
	available_from DATE  NULL,
	furnished  character varying(30) DEFAULT NULL,
	property_condition  character varying(50) DEFAULT NULL,
	parking_spaces character varying(30) DEFAULT NULL,
    status character varying(30) default 'listed',
    polygon geography(Polygon,4326),
    point geography(Point,4326),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
)

-- FUNCTION: public.__property_queries(character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, property_is_for, character varying, character varying, character varying, character varying, character varying)

DROP FUNCTION IF EXISTS public.__property_queries(character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, property_is_for, character varying, character varying, character varying, character varying, character varying);

CREATE OR REPLACE FUNCTION public.__property_queries(
	query_type character varying,
	_id character varying,
	_listed_by character varying,
	_title character varying,
	_category character varying,
	_address character varying,
	_country character varying,
	_state character varying,
	_lga character varying,
	_district character varying,
	_size character varying,
	_bedrooms character varying,
	_bathrooms character varying,
	_year_built character varying,
	_price character varying,
	_is_for property_is_for,
	_type character varying,
	_description character varying,
	_status character varying,
	_polygon character varying,
	_point character varying)
    RETURNS SETOF listed_properties 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
DECLARE
  new_id INTEGER;
  in_country character varying(255);
  in_state character varying(255);
  in_lga character varying(255);
  in_ward character varying(255);
BEGIN
IF query_type !='select' AND _polygon IS NOT NULL  THEN
	SELECT g.country_name, g.state_name, g.lga_name, g.ward_name
	INTO in_country, in_state, in_lga, in_ward
	FROM ( SELECT * FROM __get_property_address(_polygon) ) g;
END IF;
  IF query_type ='create' THEN
    INSERT INTO properties (listed_by, title, category, address, country, state, lga, district,size,bedrooms,bathrooms,year_built, price, is_for, type, description, status, polygon, point)
    VALUES (_listed_by::INTEGER,_title::character varying, _category::character varying, _address::text,COALESCE(NULLIF(_country::character varying, ''), in_country),COALESCE(NULLIF(_state::character varying, ''), in_state),COALESCE(NULLIF(_lga::character varying, ''), in_lga),COALESCE(NULLIF(_district::character varying, ''), in_ward),COALESCE(_size,''),COALESCE(_bedrooms::INTEGER,0),COALESCE(_bathrooms::INTEGER,0),COALESCE(_year_built::INTEGER,0),COALESCE(_price::NUMERIC,0.00),COALESCE(_is_for::property_is_for,'RENT'::property_is_for), _type, _description,_status, ST_GeomFromText('POLYGON(('||_polygon||'))',4326),
		   ST_GeomFromText(ST_AsText(ST_Centroid(ST_GeomFromText('POLYGON(('||_polygon||'))', 4326)))))
    RETURNING properties.id INTO new_id;
     RETURN QUERY (SELECT * from listed_properties p WHERE p.id= new_id);
  ELSIF query_type ='update' THEN
    UPDATE properties SET
      listed_by = COALESCE(_listed_by, properties.listed_by),
      title = COALESCE(_title, properties.title),
      category = COALESCE(_category, properties.category),
      country = COALESCE(_country, properties.country),
      address = COALESCE(_address, properties.address),
      state = COALESCE(_state, properties.state),
      lga = COALESCE(_lga, properties.lga),
      district = COALESCE(_district, properties.district),
      price = COALESCE(_price, properties.price),
      is_for = COALESCE(_is_for::property_is_for, properties.is_for),
      type = COALESCE(_type, properties.type),
      description = COALESCE(_description, properties.description),
      status = COALESCE(_status, properties.status),
      polygon = COALESCE(ST_GeomFromText('POLYGON(('||_polygon||'))',4326), properties.polygon),
	  point = COALESCE(ST_AsText(
			ST_Centroid(ST_GeomFromText('POLYGON(('||_polygon||'))', 4326))
		  ),properties.point )
    WHERE properties.id = _id;
    RETURN QUERY SELECT * from listed_properties p WHERE p.id= _id;
  ELSIF query_type = 'delete' THEN
    -- DELETE FROM properties WHERE id = _id;
    UPDATE properties SET
      status = COALESCE('deleted', properties.status) 
	WHERE properties.id = _id;
	 RETURN QUERY SELECT * from listed_properties p WHERE p.id= _id;
   ELSIF query_type = 'select'  THEN
	  	IF _status='is-for' THEN
        	RETURN QUERY SELECT * FROM listed_properties p WHERE p.is_for=_is_for;	
	  	ELSEIF _status='location' AND _point IS NOT NULL AND _point !=',' THEN
			  RETURN QUERY SELECT * FROM listed_properties p WHERE ST_DWithin(p.polygon, ST_SetSRID(ST_GeomFromText('POINT('||CONCAT(split_part(_point,',',2),' ',split_part(_point,',',1))||')',4326), 4326)::geography, 500000);
		ELSIF   _state IS NOT NULL THEN
	 		RETURN QUERY SELECT * from listed_properties p WHERE p.status ='listed' AND p.state=_state;
		END IF;
  END IF;
END;
$BODY$;






-- View: public.listed_properties

DROP VIEW public.listed_properties;

CREATE OR REPLACE VIEW public.listed_properties
 AS
 SELECT ( SELECT m_1.url
           FROM property_media m_1
          WHERE m_1.property_id = p.id
          ORDER BY p.id
         LIMIT 1) AS media_url,
    string_agg(m.url::text, ','::text) AS media_urls,
    p.id,
    p.listed_by,
    p.title,
    p.category,
    p.address,
    p.country,
    p.state,
    p.lga,
    p.district,
    p.size,
    p.bedrooms,
    p.bathrooms,
    p.year_built,
    p.price,
    p.rent_cost,
    p.is_for,
    p.floor_area,
    p.no_of_floors,
    p.property_type,
    p.description,
    p.amenities,
    p.rent_frequency,
    p.available_from,
    p.furnished,
    p.property_condition,
    p.parking_spaces,
    p.status,
    p.polygon,
    p.point,
    p.created_at,
    p.updated_at
   FROM properties p
     LEFT JOIN property_media m ON p.id = m.property_id
  WHERE p.status::text = 'listed'::text
  GROUP BY p.id, p.listed_by, p.title, p.category, p.address, p.country, p.state, p.lga, p.district, p.size, p.bedrooms, p.bathrooms, p.year_built, p.price, p.rent_cost, p.is_for, p.floor_area, p.no_of_floors, p.property_type, p.description, p.amenities, p.rent_frequency, p.available_from, p.furnished, p.property_condition, p.parking_spaces, p.status, p.polygon, p.point, p.created_at, p.updated_at;

ALTER TABLE public.listed_properties
    OWNER TO admin;


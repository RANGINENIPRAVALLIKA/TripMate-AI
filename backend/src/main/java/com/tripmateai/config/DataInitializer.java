package com.tripmateai.config;

import com.tripmateai.entity.*;
import com.tripmateai.enums.RoleName;
import com.tripmateai.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final DestinationRepository destinationRepository;
    private final HotelRepository hotelRepository;
    private final RestaurantRepository restaurantRepository;
    private final AttractionRepository attractionRepository;
    private final NearbyPlaceRepository nearbyPlaceRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        initRolesAndUsers();
        initDestinationsAndContent();
    }

    private void initRolesAndUsers() {
        Role userRole = roleRepository.findByName(RoleName.USER).orElseGet(() -> {
            Role r = new Role();
            r.setName(RoleName.USER);
            r.setDescription("Default application user");
            return roleRepository.save(r);
        });

        Role adminRole = roleRepository.findByName(RoleName.ADMIN).orElseGet(() -> {
            Role r = new Role();
            r.setName(RoleName.ADMIN);
            r.setDescription("Administrator with full system access");
            return roleRepository.save(r);
        });

        // Seeded Admin user (credentials not exposed publicly in UI)
        if (!userRepository.existsByEmail("admin@tripmate.ai")) {
            User admin = new User();
            admin.setFullName("TripMate Admin");
            admin.setEmail("admin@tripmate.ai");
            admin.setPassword(passwordEncoder.encode("Admin123!"));
            admin.setPhoneNumber("+91 98765 43210");
            admin.setActive(true);
            admin.setVerified(true);
            admin.setRoles(Set.of(userRole, adminRole));
            userRepository.save(admin);
            log.info("Initialized administrator account: admin@tripmate.ai");
        }
    }

    private void initDestinationsAndContent() {
        log.info("Checking and seeding comprehensive Indian destination catalog...");
        sanitizeLegacyForeignDestinations();

        List<IndianDestinationCatalog.DestinationSeed> seeds = IndianDestinationCatalog.getDestinations();
        for (IndianDestinationCatalog.DestinationSeed s : seeds) {
            Destination dest = destinationRepository.findByCityIgnoreCase(s.city()).orElseGet(() -> {
                Destination d = new Destination();
                d.setCity(s.city());
                d.setState(s.state());
                d.setCountry(s.country());
                d.setDescription(s.description());
                d.setImageUrl(s.imageUrl());
                d.setBestSeason(s.bestSeason());
                d.setAverageBudget(s.averageBudget());
                d.setLatitude(s.latitude());
                d.setLongitude(s.longitude());
                return destinationRepository.save(d);
            });

            if (!"India".equalsIgnoreCase(dest.getCountry())) {
                dest.setCountry("India");
                destinationRepository.save(dest);
            }

            // Ensure rich Indian hotels, restaurants, attractions and nearby places for premier hubs
            if (hotelRepository.findByDestinationId(dest.getId()).isEmpty()) {
                seedDestinationSpecificContent(dest);
            }
        }

        log.info("Finished ensuring 100+ Indian destinations and authentic travel spots in catalog!");
    }

    private void sanitizeLegacyForeignDestinations() {
        List<Destination> foreign = destinationRepository.findAll().stream()
                .filter(d -> !"India".equalsIgnoreCase(d.getCountry())
                        || "Tokyo".equalsIgnoreCase(d.getCity())
                        || "Paris".equalsIgnoreCase(d.getCity())
                        || "Bali".equalsIgnoreCase(d.getCity())
                        || "Rome".equalsIgnoreCase(d.getCity())
                        || "New York".equalsIgnoreCase(d.getCity())
                        || (d.getCity() != null && d.getCity().toLowerCase().contains("zermatt")))
                .toList();

        if (!foreign.isEmpty()) {
            log.info("Sanitizing {} legacy foreign destination records into authentic Indian destinations...", foreign.size());
            List<IndianDestinationCatalog.DestinationSeed> catalog = IndianDestinationCatalog.getDestinations();
            int idx = 0;
            for (Destination d : foreign) {
                if (idx < catalog.size()) {
                    IndianDestinationCatalog.DestinationSeed seed = catalog.get(idx++);
                    d.setCity(seed.city());
                    d.setState(seed.state());
                    d.setCountry("India");
                    d.setDescription(seed.description());
                    d.setImageUrl(seed.imageUrl());
                    d.setBestSeason(seed.bestSeason());
                    d.setAverageBudget(seed.averageBudget());
                    d.setLatitude(seed.latitude());
                    d.setLongitude(seed.longitude());
                    destinationRepository.save(d);
                }
            }
        }
    }

    private void seedDestinationSpecificContent(Destination dest) {
        String city = dest.getCity();
        if ("Hyderabad".equalsIgnoreCase(city)) {
            createHotels(dest, List.of(
                    new HotelSeed("Taj Falaknuma Palace", "Engine Bowli, Fatima Nagar, Falaknuma", new BigDecimal("4.9"), new BigDecimal("32000.00"), "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"),
                    new HotelSeed("ITC Kohenur Luxury Hotel", "Plot No. 5, Hitec City, Madhapur", new BigDecimal("4.8"), new BigDecimal("14500.00"), "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80"),
                    new HotelSeed("The Golkonda Hotel", "Masab Tank, Banjara Hills Rd", new BigDecimal("4.5"), new BigDecimal("4800.00"), "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80")
            ));
            createRestaurants(dest, List.of(
                    new RestaurantSeed("Paradise Biryani Heritage", "Hyderabadi Dum Biryani & Kebabs", "SD Road, Secunderabad", new BigDecimal("4.7"), "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80"),
                    new RestaurantSeed("Bawarchi Restaurant", "Authentic Nizami Cuisine", "RTC X Roads, Chikkadpally", new BigDecimal("4.8"), "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80"),
                    new RestaurantSeed("Chutneys", "South Indian Tiffins & Guntur Idli", "Banjara Hills Road No. 3", new BigDecimal("4.6"), "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80")
            ));
            createAttractions(dest, List.of(
                    new AttractionSeed("Charminar", "Iconic 16th-century four-minaret mosque and symbol of Hyderabad situated in the old city.", "Char Kaman, Ghansi Bazaar", new BigDecimal("4.8"), new BigDecimal("25.00"), "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80"),
                    new AttractionSeed("Golconda Fort", "Colossal medieval fortress renowned for acoustic architecture and diamond vault history.", "Ibrahim Bagh, Hyderabad", new BigDecimal("4.7"), new BigDecimal("25.00"), "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80"),
                    new AttractionSeed("Salar Jung Museum", "One of the three National Museums of India housing an extraordinary single-man art collection.", "Daru-sh-Shifa, Hyderabad", new BigDecimal("4.6"), new BigDecimal("50.00"), "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80")
            ));
            createNearbyPlaces(dest, List.of(
                    new NearbyPlaceSeed("Hussain Sagar Lake", "Lakeside Promenade", "Tank Bund Road", new BigDecimal("17.4239"), new BigDecimal("78.4738")),
                    new NearbyPlaceSeed("Qutb Shahi Tombs", "Historic Royal Tombs", "Ibrahim Bagh", new BigDecimal("17.3941"), new BigDecimal("78.3962"))
            ));
        } else if ("Munnar".equalsIgnoreCase(city)) {
            createHotels(dest, List.of(
                    new HotelSeed("Blanket Hotel & Spa", "Attukad Waterfalls Road, Pallivasal", new BigDecimal("4.8"), new BigDecimal("11500.00"), "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"),
                    new HotelSeed("Windermere Estate", "Pothamedu, Munnar", new BigDecimal("4.7"), new BigDecimal("9800.00"), "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80"),
                    new HotelSeed("KTDC Tea County", "KTDC Hill Resort, Munnar", new BigDecimal("4.5"), new BigDecimal("5200.00"), "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80")
            ));
            createRestaurants(dest, List.of(
                    new RestaurantSeed("Saravana Bhavan Munnar", "Pure Vegetarian South Indian Meals", "M.G. Road, Munnar Town", new BigDecimal("4.6"), "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80"),
                    new RestaurantSeed("Rapsy Restaurant", "Kerala Parotta & Malabar Curries", "Main Bazaar, Munnar", new BigDecimal("4.5"), "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80")
            ));
            createAttractions(dest, List.of(
                    new AttractionSeed("Eravikulam National Park", "Sanctuary of the endangered Nilgiri Tahr and rolling Anamudi peak vistas.", "Kannandevan Hills, Munnar", new BigDecimal("4.8"), new BigDecimal("200.00"), "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80"),
                    new AttractionSeed("KDHP Tea Museum", "Century-old tea roller machinery and live tea tasting sessions.", "Nullatanni Estate, Munnar", new BigDecimal("4.7"), new BigDecimal("125.00"), "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80"),
                    new AttractionSeed("Mattupetty Dam & Lake", "Scenic masonry dam popular for speedboating amidst mist-laden tea hills.", "Mattupetty, Munnar", new BigDecimal("4.6"), new BigDecimal("50.00"), "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80")
            ));
            createNearbyPlaces(dest, List.of(
                    new NearbyPlaceSeed("Attukad Waterfalls", "Cascading Stream", "Pallivasal", new BigDecimal("10.0460"), new BigDecimal("77.0504")),
                    new NearbyPlaceSeed("Top Station Viewpoint", "High-Altitude Panorama", "Munnar-Kodaikanal Pass", new BigDecimal("10.1250"), new BigDecimal("77.2435"))
            ));
        } else if ("Jaipur".equalsIgnoreCase(city)) {
            createHotels(dest, List.of(
                    new HotelSeed("Rambagh Palace", "Bhawani Singh Road, Jaipur", new BigDecimal("4.9"), new BigDecimal("38000.00"), "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"),
                    new HotelSeed("Samode Haveli", "Gangapole, Jaipur", new BigDecimal("4.8"), new BigDecimal("14000.00"), "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80"),
                    new HotelSeed("Pearl Palace Heritage", "Hathroi Fort, Ajmer Road", new BigDecimal("4.7"), new BigDecimal("4500.00"), "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80")
            ));
            createRestaurants(dest, List.of(
                    new RestaurantSeed("1135 AD Amer", "Royal Rajasthani Dining inside Amer Fort", "Amer Fort, Amer, Jaipur", new BigDecimal("4.8"), "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80"),
                    new RestaurantSeed("Laxmi Mishthan Bhandar (LMB)", "Traditional Dal Baati Churma & Ghewar", "Johari Bazaar, Old City", new BigDecimal("4.6"), "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80")
            ));
            createAttractions(dest, List.of(
                    new AttractionSeed("Amer Fort", "Magnificent hilltop sandstone and marble fortress with Sheesh Mahal mirror palace.", "Devisinghpura, Amer, Jaipur", new BigDecimal("4.9"), new BigDecimal("100.00"), "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80"),
                    new AttractionSeed("Hawa Mahal", "Palace of Winds featuring 953 honeycombed jharokha windows built in 1799.", "Hawa Mahal Rd, Badi Choupad", new BigDecimal("4.8"), new BigDecimal("50.00"), "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80"),
                    new AttractionSeed("City Palace Jaipur", "Splendid palace complex blending Rajput, Mughal, and European architecture.", "Tulsi Marg, Gangori Bazaar", new BigDecimal("4.7"), new BigDecimal("300.00"), "https://images.unsplash.com/photo-1518457607834-6e8d80c183c5?auto=format&fit=crop&w=800&q=80")
            ));
            createNearbyPlaces(dest, List.of(
                    new NearbyPlaceSeed("Jal Mahal", "Water Palace in Man Sagar Lake", "Amer Road", new BigDecimal("26.9534"), new BigDecimal("75.8462")),
                    new NearbyPlaceSeed("Jantar Mantar", "Astronomical UNESCO Monument", "Gangori Bazaar", new BigDecimal("26.9248"), new BigDecimal("75.8246"))
            ));
        } else if ("Varanasi".equalsIgnoreCase(city)) {
            createHotels(dest, List.of(
                    new HotelSeed("BrijRama Palace Heritage", "Darbhanga Ghat, Dashashwamedh", new BigDecimal("4.9"), new BigDecimal("24000.00"), "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"),
                    new HotelSeed("Taj Ganges Varanasi", "Nadesar Palace Grounds", new BigDecimal("4.8"), new BigDecimal("15000.00"), "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80"),
                    new HotelSeed("Ganpati Guest House", "Meer Ghat, Old Varanasi", new BigDecimal("4.5"), new BigDecimal("3500.00"), "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80")
            ));
            createRestaurants(dest, List.of(
                    new RestaurantSeed("Kashi Chat Bhandar", "Tamatar Chat, Palak Chat & Gulab Jamun", "D 37/49, Godowlia Road", new BigDecimal("4.8"), "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80"),
                    new RestaurantSeed("Baati Chokha", "Traditional Purvanchali Sattu Baati Chokha", "Near Anand Cinema, Teliyabag", new BigDecimal("4.7"), "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80")
            ));
            createAttractions(dest, List.of(
                    new AttractionSeed("Dashashwamedh Ghat Ganga Aarti", "World-famous evening Aarti ceremony performed by Vedic priests with brass oil lamps.", "Dashashwamedh Ghat", new BigDecimal("4.9"), BigDecimal.ZERO, "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80"),
                    new AttractionSeed("Kashi Vishwanath Temple Corridor", "Sacred Jyotirlinga shrine revitalized with a direct pilgrimage walkway to the river.", "Lahori Tola, Varanasi", new BigDecimal("4.9"), BigDecimal.ZERO, "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=800&q=80"),
                    new AttractionSeed("Sarnath Dhamek Stupa", "The deer park where Lord Buddha gave his first sermon after attaining enlightenment.", "Sarnath, Varanasi", new BigDecimal("4.7"), new BigDecimal("25.00"), "https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?auto=format&fit=crop&w=800&q=80")
            ));
            createNearbyPlaces(dest, List.of(
                    new NearbyPlaceSeed("Assi Ghat", "Southern Pilgrimage Ghat & Yoga", "Assi Ghat", new BigDecimal("25.2884"), new BigDecimal("83.0062")),
                    new NearbyPlaceSeed("Manikarnika Ghat", "Sacred Cremation Ghat", "Ghasi Tola", new BigDecimal("25.3109"), new BigDecimal("83.0141"))
            ));
        } else if ("Alappuzha".equalsIgnoreCase(city)) {
            createHotels(dest, List.of(
                    new HotelSeed("Lake Palace Resort", "Thirumala Ward, Chungam", new BigDecimal("4.8"), new BigDecimal("16000.00"), "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"),
                    new HotelSeed("Punnamada Resort", "Punnamada, Alappuzha", new BigDecimal("4.7"), new BigDecimal("12000.00"), "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80"),
                    new HotelSeed("Alleppey Heritage Villa", "VCSB Road, Alappuzha", new BigDecimal("4.5"), new BigDecimal("3800.00"), "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80")
            ));
            createRestaurants(dest, List.of(
                    new RestaurantSeed("Thaff Restaurant", "Karimeen Pollichathu & Appam Stew", "General Hospital Junction", new BigDecimal("4.6"), "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80"),
                    new RestaurantSeed("Halais Restaurant", "Malabar Seafood & Biryani", "CCSb Road, Alappuzha", new BigDecimal("4.6"), "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80")
            ));
            createAttractions(dest, List.of(
                    new AttractionSeed("Alleppey Backwater Houseboat Cruise", "Classic overnight Kettuvallam journey navigating Vembanad lake and tranquil canals.", "Finishing Point, Alappuzha", new BigDecimal("4.9"), new BigDecimal("8500.00"), "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80"),
                    new AttractionSeed("Alappuzha Beach & Old Pier", "Scenic coastline featuring a 150-year-old historic pier extending into the Arabian Sea.", "Alappuzha Beach", new BigDecimal("4.6"), BigDecimal.ZERO, "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80")
            ));
            createNearbyPlaces(dest, List.of(
                    new NearbyPlaceSeed("Marari Beach", "Quiet Coconut Fisherfolk Sands", "Mararikulam", new BigDecimal("9.5960"), new BigDecimal("76.2974")),
                    new NearbyPlaceSeed("Kuttanad Rice Bowl", "Below Sea Level Farming Waterways", "Kuttanad", new BigDecimal("9.4520"), new BigDecimal("76.4380"))
            ));
        } else if ("Panaji".equalsIgnoreCase(city)) {
            createHotels(dest, List.of(
                    new HotelSeed("Taj Cidade de Goa Heritage", "Vainguinim Beach, Panaji", new BigDecimal("4.8"), new BigDecimal("16500.00"), "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"),
                    new HotelSeed("The Postcard Velha", "Our Lady of Mount, Old Goa Rd", new BigDecimal("4.8"), new BigDecimal("12000.00"), "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80")
            ));
            createRestaurants(dest, List.of(
                    new RestaurantSeed("Viva Panjim", "Traditional Prawn Balchão & Bebinca", "House No. 178, Fontainhas", new BigDecimal("4.7"), "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80"),
                    new RestaurantSeed("Mum's Kitchen", "Heritage Goan Hindu & Christian Cuisine", "854, Martin's Building, D.B. Marg", new BigDecimal("4.6"), "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80")
            ));
            createAttractions(dest, List.of(
                    new AttractionSeed("Our Lady of the Immaculate Conception Church", "Stately baroque 17th-century Catholic church atop zig-zagging stairways in Panaji.", "Church Square, Panaji", new BigDecimal("4.7"), BigDecimal.ZERO, "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80"),
                    new AttractionSeed("Fontainhas Latin Quarter", "UNESCO-recognized Portuguese residential quarter lined with vibrant terracotta villas.", "Fontainhas, Panaji", new BigDecimal("4.8"), BigDecimal.ZERO, "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80")
            ));
            createNearbyPlaces(dest, List.of(
                    new NearbyPlaceSeed("Miramar Beach", "Urban Sunset Strand", "Miramar", new BigDecimal("15.4820"), new BigDecimal("73.8080")),
                    new NearbyPlaceSeed("Dona Paula Viewpoint", "Arabian Sea Promontory", "Dona Paula", new BigDecimal("15.4520"), new BigDecimal("73.8050"))
            ));
        }
    }

    private void createHotels(Destination d, List<HotelSeed> seeds) {
        for (HotelSeed s : seeds) {
            Hotel h = new Hotel();
            h.setDestination(d);
            h.setName(s.name);
            h.setAddress(s.address);
            h.setRating(s.rating);
            h.setPricePerNight(s.price);
            h.setImageUrl(s.image);
            hotelRepository.save(h);
        }
    }

    private void createRestaurants(Destination d, List<RestaurantSeed> seeds) {
        for (RestaurantSeed s : seeds) {
            Restaurant r = new Restaurant();
            r.setDestination(d);
            r.setName(s.name);
            r.setCuisine(s.cuisine);
            r.setAddress(s.address);
            r.setRating(s.rating);
            r.setImageUrl(s.image);
            restaurantRepository.save(r);
        }
    }

    private void createAttractions(Destination d, List<AttractionSeed> seeds) {
        for (AttractionSeed s : seeds) {
            Attraction a = new Attraction();
            a.setDestination(d);
            a.setName(s.name);
            a.setDescription(s.desc);
            a.setAddress(s.address);
            a.setRating(s.rating);
            a.setEntryFee(s.fee);
            a.setImageUrl(s.image);
            attractionRepository.save(a);
        }
    }

    private void createNearbyPlaces(Destination d, List<NearbyPlaceSeed> seeds) {
        for (NearbyPlaceSeed s : seeds) {
            NearbyPlace p = new NearbyPlace();
            p.setDestination(d);
            p.setName(s.name);
            p.setCategory(s.cat);
            p.setAddress(s.address);
            p.setLatitude(s.lat);
            p.setLongitude(s.lng);
            nearbyPlaceRepository.save(p);
        }
    }

    private record HotelSeed(String name, String address, BigDecimal rating, BigDecimal price, String image) {}
    private record RestaurantSeed(String name, String cuisine, String address, BigDecimal rating, String image) {}
    private record AttractionSeed(String name, String desc, String address, BigDecimal rating, BigDecimal fee, String image) {}
    private record NearbyPlaceSeed(String name, String cat, String address, BigDecimal lat, BigDecimal lng) {}
}

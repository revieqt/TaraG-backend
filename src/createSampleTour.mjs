import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:5000/api';

const sampleTours = [
  {
    title: "Cebu Heritage and Culture Tour",
    description: "Discover the rich history and vibrant culture of Cebu City. Visit iconic landmarks, historical sites, and experience local traditions.",
    images: [
      "https://example.com/cebu-heritage-1.jpg",
      "https://example.com/cebu-heritage-2.jpg"
    ],
    agencyID: "agency_cebu_001",
    tags: ["heritage", "culture", "history", "landmarks"],
    status: "active",
    itinerary: {
      startDate: "2024-02-15T08:00:00Z",
      endDate: "2024-02-15T18:00:00Z",
      planDaily: false,
      locations: [
        {
          locationName: "Magellan's Cross",
          latitude: 10.2935,
          longitude: 123.9018,
          note: "Historic landmark where Christianity was introduced to the Philippines"
        },
        {
          locationName: "Basilica del Santo Niño",
          latitude: 10.2944,
          longitude: 123.9015,
          note: "Oldest Roman Catholic church in the Philippines"
        },
        {
          locationName: "Fort San Pedro",
          latitude: 10.2929,
          longitude: 123.9067,
          note: "Triangular military defense structure built by Spanish conquistadors"
        }
      ]
    },
    pricing: {
      currency: "PHP",
      price: 2500,
      inclusions: ["Professional tour guide", "Transportation", "Entrance fees", "Bottled water"],
      exclusions: ["Meals", "Personal expenses", "Souvenirs"]
    },
    participants: {
      maxCapacity: 25,
      members: [],
      tourGuides: [
        {
          userID: "guide_001",
          name: "Maria Santos",
          username: "maria_guide",
          profileImage: "https://example.com/guide-maria.jpg"
        }
      ]
    }
  },
  {
    title: "Bohol Countryside Adventure",
    description: "Experience the natural wonders of Bohol including the famous Chocolate Hills, tarsier sanctuary, and river cruise.",
    images: [
      "https://example.com/bohol-adventure-1.jpg",
      "https://example.com/bohol-adventure-2.jpg",
      "https://example.com/bohol-adventure-3.jpg"
    ],
    agencyID: "agency_bohol_002",
    tags: ["nature", "adventure", "wildlife", "countryside"],
    status: "active",
    itinerary: {
      startDate: "2024-03-01T06:00:00Z",
      endDate: "2024-03-02T20:00:00Z",
      planDaily: true,
      locations: [
        {
          day: 1,
          date: "2024-03-01",
          locations: [
            {
              locationName: "Chocolate Hills",
              latitude: 9.8167,
              longitude: 124.1667,
              note: "Famous geological formation with over 1,200 hills"
            },
            {
              locationName: "Tarsier Sanctuary",
              latitude: 9.6500,
              longitude: 124.0833,
              note: "Conservation area for the world's smallest primate"
            }
          ],
          activities: ["Sightseeing", "Wildlife viewing", "Photography"],
          notes: "Full day exploring Bohol's natural wonders"
        },
        {
          day: 2,
          date: "2024-03-02",
          locations: [
            {
              locationName: "Loboc River",
              latitude: 9.6333,
              longitude: 124.0333,
              note: "Scenic river cruise with floating restaurant"
            }
          ],
          activities: ["River cruise", "Local dining", "Cultural show"],
          notes: "Relaxing river cruise and cultural experience"
        }
      ]
    },
    pricing: {
      currency: "PHP",
      price: 4500,
      inclusions: ["2D1N accommodation", "All meals", "Transportation", "Boat transfers", "Tour guide"],
      exclusions: ["Travel insurance", "Personal expenses", "Optional activities"]
    },
    participants: {
      maxCapacity: 20,
      members: [],
      tourGuides: [
        {
          userID: "guide_002",
          name: "Juan Dela Cruz",
          username: "juan_bohol",
          profileImage: "https://example.com/guide-juan.jpg"
        }
      ]
    }
  },
  {
    title: "Palawan Island Hopping Paradise",
    description: "Explore the pristine beaches and crystal-clear waters of Palawan. Visit hidden lagoons, snorkel in coral reefs, and enjoy tropical paradise.",
    images: [
      "https://example.com/palawan-paradise-1.jpg",
      "https://example.com/palawan-paradise-2.jpg"
    ],
    agencyID: "agency_palawan_003",
    tags: ["beach", "island hopping", "snorkeling", "paradise", "tropical"],
    status: "active",
    itinerary: {
      startDate: "2024-04-10T07:00:00Z",
      endDate: "2024-04-12T17:00:00Z",
      planDaily: true,
      locations: [
        {
          day: 1,
          date: "2024-04-10",
          locations: [
            {
              locationName: "El Nido Big Lagoon",
              latitude: 11.2028,
              longitude: 119.4167,
              note: "Stunning lagoon surrounded by limestone cliffs"
            },
            {
              locationName: "Small Lagoon",
              latitude: 11.2000,
              longitude: 119.4100,
              note: "Hidden lagoon accessible by kayak"
            }
          ],
          activities: ["Island hopping", "Kayaking", "Swimming"],
          notes: "Explore the famous lagoons of El Nido"
        },
        {
          day: 2,
          date: "2024-04-11",
          locations: [
            {
              locationName: "Shimizu Island",
              latitude: 11.1833,
              longitude: 119.4000,
              note: "Perfect for snorkeling and beach relaxation"
            }
          ],
          activities: ["Snorkeling", "Beach relaxation", "Underwater photography"],
          notes: "Underwater adventure and beach time"
        },
        {
          day: 3,
          date: "2024-04-12",
          locations: [
            {
              locationName: "Seven Commandos Beach",
              latitude: 11.1900,
              longitude: 119.3950,
              note: "White sand beach with crystal clear waters"
            }
          ],
          activities: ["Beach activities", "Souvenir shopping", "Departure preparation"],
          notes: "Final day relaxation and departure"
        }
      ]
    },
    pricing: {
      currency: "PHP",
      price: 8500,
      inclusions: ["3D2N accommodation", "Island hopping tours", "Snorkeling gear", "All meals", "Boat transfers"],
      exclusions: ["Airfare", "Environmental fees", "Personal expenses", "Alcoholic beverages"]
    },
    participants: {
      maxCapacity: 15,
      members: [],
      tourGuides: [
        {
          userID: "guide_003",
          name: "Ana Reyes",
          username: "ana_palawan",
          profileImage: "https://example.com/guide-ana.jpg"
        }
      ]
    }
  },
  {
    title: "Siargao Surfing and Island Life",
    description: "Experience the surfing capital of the Philippines. Learn to surf, explore island life, and discover hidden gems in Siargao.",
    images: [
      "https://example.com/siargao-surf-1.jpg",
      "https://example.com/siargao-surf-2.jpg"
    ],
    agencyID: "agency_siargao_004",
    tags: ["surfing", "island life", "adventure", "beach", "sports"],
    status: "draft",
    itinerary: {
      startDate: "2024-05-20T08:00:00Z",
      endDate: "2024-05-23T16:00:00Z",
      planDaily: true,
      locations: [
        {
          day: 1,
          date: "2024-05-20",
          locations: [
            {
              locationName: "Cloud 9 Surf Break",
              latitude: 9.8500,
              longitude: 126.1667,
              note: "World-famous surfing spot with perfect barrels"
            }
          ],
          activities: ["Surf lessons", "Beach orientation", "Equipment setup"],
          notes: "Introduction to Siargao surfing"
        },
        {
          day: 2,
          date: "2024-05-21",
          locations: [
            {
              locationName: "Cloud 9 Surf Break",
              latitude: 9.8500,
              longitude: 126.1667,
              note: "Advanced surfing practice"
            }
          ],
          activities: ["Advanced surf training", "Wave reading", "Surfing competition"],
          notes: "Intensive surfing practice day"
        },
        {
          day: 3,
          date: "2024-05-22",
          locations: [
            {
              locationName: "Magpupungko Rock Pools",
              latitude: 9.9167,
              longitude: 126.1833,
              note: "Natural rock pools perfect for swimming during low tide"
            }
          ],
          activities: ["Rock pool exploration", "Swimming", "Photography"],
          notes: "Explore natural rock formations and pools"
        },
        {
          day: 4,
          date: "2024-05-23",
          locations: [
            {
              locationName: "Sugba Lagoon",
              latitude: 9.8833,
              longitude: 126.1500,
              note: "Pristine lagoon ideal for kayaking and paddleboarding"
            }
          ],
          activities: ["Kayaking", "Paddleboarding", "Island life experience"],
          notes: "Final day lagoon adventure"
        }
      ]
    },
    pricing: {
      currency: "PHP",
      price: 6500,
      inclusions: ["4D3N accommodation", "Surfboard rental", "Surf lessons", "Island tours", "Motorcycle rental"],
      exclusions: ["Meals", "Airfare", "Personal expenses", "Additional surf lessons"]
    },
    participants: {
      maxCapacity: 12,
      members: [],
      tourGuides: [
        {
          userID: "guide_004",
          name: "Rico Mendoza",
          username: "rico_surf",
          profileImage: "https://example.com/guide-rico.jpg"
        }
      ]
    }
  },
  {
    title: "Batanes Cultural and Scenic Tour",
    description: "Discover the northernmost province of the Philippines. Experience Ivatan culture, rolling hills, and dramatic coastlines.",
    images: [
      "https://example.com/batanes-scenic-1.jpg",
      "https://example.com/batanes-scenic-2.jpg"
    ],
    agencyID: "agency_batanes_005",
    tags: ["culture", "scenic", "heritage", "countryside", "unique"],
    status: "active",
    itinerary: {
      startDate: "2024-06-15T09:00:00Z",
      endDate: "2024-06-18T15:00:00Z",
      planDaily: true,
      locations: [
        {
          day: 1,
          date: "2024-06-15",
          locations: [
            {
              locationName: "Basco Lighthouse",
              latitude: 20.4500,
              longitude: 121.9667,
              note: "Iconic lighthouse with panoramic views of Basco"
            }
          ],
          activities: ["Lighthouse tour", "Scenic photography", "Cultural orientation"],
          notes: "Welcome to Batanes - iconic lighthouse visit"
        },
        {
          day: 2,
          date: "2024-06-16",
          locations: [
            {
              locationName: "Valugan Boulder Beach",
              latitude: 20.4167,
              longitude: 121.9833,
              note: "Unique beach covered with smooth volcanic boulders"
            }
          ],
          activities: ["Beach exploration", "Geological study", "Coastal walk"],
          notes: "Discover unique volcanic boulder formations"
        },
        {
          day: 3,
          date: "2024-06-17",
          locations: [
            {
              locationName: "Savidug Village",
              latitude: 20.3833,
              longitude: 121.9500,
              note: "Traditional Ivatan stone houses and cultural immersion"
            }
          ],
          activities: ["Village tour", "Cultural activities", "Traditional crafts"],
          notes: "Immerse in authentic Ivatan culture"
        },
        {
          day: 4,
          date: "2024-06-18",
          locations: [
            {
              locationName: "Marlboro Hills",
              latitude: 20.4333,
              longitude: 121.9500,
              note: "Rolling green hills reminiscent of New Zealand"
            }
          ],
          activities: ["Hill trekking", "Panoramic photography", "Farewell ceremony"],
          notes: "Final day scenic hills exploration"
        }
      ]
    },
    pricing: {
      currency: "PHP",
      price: 12000,
      inclusions: ["4D3N accommodation", "All meals", "Cultural activities", "Transportation", "Local guide"],
      exclusions: ["Airfare", "Travel insurance", "Personal expenses", "Souvenirs"]
    },
    participants: {
      maxCapacity: 18,
      members: [],
      tourGuides: [
        {
          userID: "guide_005",
          name: "Elena Valdez",
          username: "elena_batanes",
          profileImage: "https://example.com/guide-elena.jpg"
        }
      ]
    }
  }
];

async function createTour(tourData) {
  try {
    const response = await fetch(`${API_BASE_URL}/tours/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tourData)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log(`✅ Successfully created tour: "${tourData.title}" (ID: ${result.tourId})`);
      return { success: true, tourId: result.tourId };
    } else {
      console.error(`❌ Failed to create tour: "${tourData.title}"`);
      console.error(`Error: ${result.error}`);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error(`❌ Network error creating tour: "${tourData.title}"`);
    console.error(`Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function createAllSampleTours() {
  console.log('🚀 Starting to create sample tours...\n');
  
  const results = [];
  
  for (let i = 0; i < sampleTours.length; i++) {
    const tour = sampleTours[i];
    console.log(`Creating tour ${i + 1}/${sampleTours.length}: "${tour.title}"`);
    
    const result = await createTour(tour);
    results.push({ tour: tour.title, ...result });
    
    // Add a small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📊 Summary:');
  console.log('='.repeat(50));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Successfully created: ${successful.length} tours`);
  console.log(`❌ Failed to create: ${failed.length} tours`);
  
  if (successful.length > 0) {
    console.log('\n✅ Successful tours:');
    successful.forEach(tour => {
      console.log(`  - ${tour.tour} (ID: ${tour.tourId})`);
    });
  }
  
  if (failed.length > 0) {
    console.log('\n❌ Failed tours:');
    failed.forEach(tour => {
      console.log(`  - ${tour.tour}: ${tour.error}`);
    });
  }
  
  console.log('\n🎉 Sample tour creation completed!');
}

// Run the script
createAllSampleTours().catch(error => {
  console.error('💥 Script execution failed:', error);
  process.exit(1);
});
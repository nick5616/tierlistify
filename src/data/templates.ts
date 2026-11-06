/**
 * Starter lists. Every image URL was checked as loading with CORS headers, so
 * these work in the board and in saved images. Regenerate rather than guess:
 * Wikimedia rejects thumbnail sizes it didn't list itself.
 */

export interface Template {
    id: string;
    name: string;
    blurb: string;
    items: { name: string; image: string | null }[];
}

export const TEMPLATES: Template[] = [
    {
        id: "naruto",
        name: "Naruto Characters",
        blurb: "Who actually carries the series?",
        items: [
            {
                name: "Naruto Uzumaki",
                image: "https://s4.anilist.co/file/anilistcdn/character/large/b17-phjcWCkRuIhu.png",
            },
            {
                name: "Sasuke Uchiha",
                image: "https://s4.anilist.co/file/anilistcdn/character/large/b13-SISLEw1oAD7a.png",
            },
            {
                name: "Kakashi Hatake",
                image: "https://s4.anilist.co/file/anilistcdn/character/large/b85-mkVBh2yjxjmx.png",
            },
            {
                name: "Sakura Haruno",
                image: "https://s4.anilist.co/file/anilistcdn/character/large/b145-IorfpI8arxeX.png",
            },
            {
                name: "Itachi Uchiha",
                image: "https://s4.anilist.co/file/anilistcdn/character/large/b14-9Kb1E5oel1ke.png",
            },
            {
                name: "Rock Lee",
                image: "https://s4.anilist.co/file/anilistcdn/character/large/b306-oUTOO45xInXt.png",
            },
            {
                name: "Guy Might",
                image: "https://s4.anilist.co/file/anilistcdn/character/large/b307-xieUEdhdTVwQ.png",
            },
            {
                name: "Zabuza Momochi",
                image: "https://s4.anilist.co/file/anilistcdn/character/large/b728-zHw77BzLzQKT.jpg",
            },
            {
                name: "Anko Mitarashi",
                image: "https://s4.anilist.co/file/anilistcdn/character/large/b809-FhWTN0LFVzRa.png",
            },
            {
                name: "Hinata Hyuuga",
                image: "https://s4.anilist.co/file/anilistcdn/character/large/b1555-Q41GLTV3FvYF.png",
            },
            {
                name: "Gaara",
                image: "https://s4.anilist.co/file/anilistcdn/character/large/b1662-4E5J0LX9jZKZ.png",
            },
            {
                name: "Neji Hyuuga",
                image: "https://s4.anilist.co/file/anilistcdn/character/large/b1694-TL4obouDwJ7k.jpg",
            },
            {
                name: "Deidara",
                image: "https://s4.anilist.co/file/anilistcdn/character/large/b1902-JsEFRFwjmtZJ.png",
            },
            {
                name: "Shikamaru Nara",
                image: "https://s4.anilist.co/file/anilistcdn/character/large/b2007-QaesJlIZDifj.jpg",
            },
            {
                name: "Chouji Akimichi",
                image: "https://s4.anilist.co/file/anilistcdn/character/large/n2008-j1oCafEGZucg.png",
            },
            {
                name: "Ino Yamanaka",
                image: "https://s4.anilist.co/file/anilistcdn/character/large/b2009-H7n38Ns1fr0Y.jpg",
            },
        ],
    },
    {
        id: "ghibli",
        name: "Studio Ghibli Films",
        blurb: "The hardest list you will make today",
        items: [
            {
                name: "Spirited Away",
                image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx199-sWefXJvXkDOb.jpg",
            },
            {
                name: "My Neighbor Totoro",
                image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx523-fErBvxOHP7IX.jpg",
            },
            {
                name: "Princess Mononoke",
                image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx164-ySuGzCWVw2cL.jpg",
            },
            {
                name: "Howl's Moving Castle",
                image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx431-o8Lj3XkjHm2k.jpg",
            },
            {
                name: "Kiki's Delivery Service",
                image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx512-UwP8X4BR8YoM.png",
            },
            {
                name: "Ponyo",
                image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx2890-wcNtFr6aUYOR.jpg",
            },
            {
                name: "Castle in the Sky",
                image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx513-yM7Dlt65N4Rl.jpg",
            },
            {
                name: "Nausicaä of the Valley of the Wind",
                image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx572-ZE3kHBA6U0X1.jpg",
            },
        ],
    },
    {
        id: "pies",
        name: "Pies",
        blurb: "Settle it at the next family dinner",
        items: [
            {
                name: "Apple pie",
                image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2f/Apple_pie_14.jpg/330px-Apple_pie_14.jpg",
            },
            {
                name: "Cherry pie",
                image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7e/Cherry-Pie-Slice.jpg/330px-Cherry-Pie-Slice.jpg",
            },
            {
                name: "Pumpkin pie",
                image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e8/Pumpkin-Pie-Whole-Slice.jpg/330px-Pumpkin-Pie-Whole-Slice.jpg",
            },
            {
                name: "Pecan pie",
                image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bf/My_first_pecan_pie%21.jpg/330px-My_first_pecan_pie%21.jpg",
            },
            {
                name: "Key lime pie",
                image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/88/Slice_of_Key_Lime_Pie.jpg/330px-Slice_of_Key_Lime_Pie.jpg",
            },
            {
                name: "Blueberry pie",
                image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/95/Blueberry_Pie_with_Almond_Crumb_Topping%2C_May_2009.jpg/330px-Blueberry_Pie_with_Almond_Crumb_Topping%2C_May_2009.jpg",
            },
            {
                name: "Lemon meringue pie",
                image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/68/LemonMerangePie.jpg/330px-LemonMerangePie.jpg",
            },
            {
                name: "Strawberry rhubarb pie",
                image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/28/RhubarbPie.jpg/330px-RhubarbPie.jpg",
            },
            {
                name: "Banoffee pie",
                image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ac/Banoffeepie.jpg/330px-Banoffeepie.jpg",
            },
            {
                name: "Sweet potato pie",
                image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b6/Sweet_Potato_Pie_%2826196501606%29.jpg/330px-Sweet_Potato_Pie_%2826196501606%29.jpg",
            },
        ],
    },
    {
        id: "pasta",
        name: "Pasta Shapes",
        blurb: "Yes, shape matters",
        items: [
            {
                name: "Spaghetti",
                image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/92/Spaghettoni.jpg/330px-Spaghettoni.jpg",
            },
            {
                name: "Penne",
                image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0b/Pennelisce_closeup.png/330px-Pennelisce_closeup.png",
            },
            {
                name: "Fusilli",
                image: null,
            },
            {
                name: "Farfalle",
                image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ac/Farfalle_Pasta.JPG/330px-Farfalle_Pasta.JPG",
            },
            {
                name: "Rigatoni",
                image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/84/Rigatoni.jpg/330px-Rigatoni.jpg",
            },
            {
                name: "Tagliatelle",
                image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/67/Nests_of_tagliatelle_bolognesi.jpg/330px-Nests_of_tagliatelle_bolognesi.jpg",
            },
            {
                name: "Orecchiette",
                image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8d/Orecchiette_carbonara.jpg/330px-Orecchiette_carbonara.jpg",
            },
            {
                name: "Conchiglie",
                image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/20/Conchiglie_rigate.png/330px-Conchiglie_rigate.png",
            },
            {
                name: "Ravioli",
                image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/95/Flickr_-_cyclonebill_-_Ravioli_med_skinke_og_asparges_i_mascarponecreme.jpg/330px-Flickr_-_cyclonebill_-_Ravioli_med_skinke_og_asparges_i_mascarponecreme.jpg",
            },
            {
                name: "Gnocchi",
                image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/86/Gnocchi_di_ricotta_burro_e_salvia.jpg/330px-Gnocchi_di_ricotta_burro_e_salvia.jpg",
            },
            {
                name: "Lasagne",
                image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/ba/Lasagne_-_stonesoup.jpg/330px-Lasagne_-_stonesoup.jpg",
            },
            {
                name: "Orzo",
                image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/43/Orzo.jpg/330px-Orzo.jpg",
            },
        ],
    },
    {
        id: "dogs",
        name: "Dog Breeds",
        blurb: "They are all good. Rank them anyway.",
        items: [
            {
                name: "Golden Retriever",
                image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bd/Golden_Retriever_Dukedestiny01_drvd.jpg/330px-Golden_Retriever_Dukedestiny01_drvd.jpg",
            },
            {
                name: "Labrador Retriever",
                image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/34/Labrador_on_Quantock_%282175262184%29.jpg/330px-Labrador_on_Quantock_%282175262184%29.jpg",
            },
            {
                name: "German Shepherd",
                image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d0/German_Shepherd_-_DSC_0346_%2810096362833%29.jpg/330px-German_Shepherd_-_DSC_0346_%2810096362833%29.jpg",
            },
            {
                name: "Poodle",
                image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f8/Full_attention_%288067543690%29.jpg/330px-Full_attention_%288067543690%29.jpg",
            },
            {
                name: "Dachshund",
                image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/be/%EB%8B%A5%EC%8A%A4%ED%9B%88%ED%8A%B8%28%EB%8B%A8%EB%AA%A8%EC%A2%85%29_%28Dachshund_%28Short%29%29.jpg/330px-%EB%8B%A5%EC%8A%A4%ED%9B%88%ED%8A%B8%28%EB%8B%A8%EB%AA%A8%EC%A2%85%29_%28Dachshund_%28Short%29%29.jpg",
            },
            {
                name: "Shiba Inu",
                image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6b/Taka_Shiba.jpg/330px-Taka_Shiba.jpg",
            },
            {
                name: "Pembroke Welsh Corgi",
                image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/99/Welsh_Pembroke_Corgi.jpg/330px-Welsh_Pembroke_Corgi.jpg",
            },
            {
                name: "Siberian Husky",
                image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8b/Husky_L.jpg/330px-Husky_L.jpg",
            },
            {
                name: "Beagle",
                image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/55/Beagle_600.jpg/330px-Beagle_600.jpg",
            },
            {
                name: "Border Collie",
                image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e4/Border_Collie_600.jpg/330px-Border_Collie_600.jpg",
            },
            {
                name: "Pug",
                image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f0/Mops_oct09_cropped2.jpg/330px-Mops_oct09_cropped2.jpg",
            },
            {
                name: "French Bulldog",
                image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/18/2008-07-28_Dog_at_Frolick_Field.jpg/330px-2008-07-28_Dog_at_Frolick_Field.jpg",
            },
        ],
    },
    {
        id: "elements",
        name: "Chemical Elements",
        blurb: "Periodic table power rankings",
        items: [
            {
                name: "Gold",
                image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d7/Gold-crystals.jpg/330px-Gold-crystals.jpg",
            },
            {
                name: "Silver",
                image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/55/Silver_crystal.jpg/330px-Silver_crystal.jpg",
            },
            {
                name: "Iron",
                image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ad/Iron_electrolytic_and_1cm3_cube.jpg/330px-Iron_electrolytic_and_1cm3_cube.jpg",
            },
            {
                name: "Copper",
                image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f0/NatCopper.jpg/330px-NatCopper.jpg",
            },
            {
                name: "Carbon",
                image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f0/Graphite-and-diamond-with-scale.jpg/330px-Graphite-and-diamond-with-scale.jpg",
            },
            {
                name: "Oxygen",
                image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a0/Liquid_oxygen_in_a_beaker_%28cropped_and_retouched%29.jpg/330px-Liquid_oxygen_in_a_beaker_%28cropped_and_retouched%29.jpg",
            },
            {
                name: "Hydrogen",
                image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/83/Hydrogen_discharge_tube.jpg/330px-Hydrogen_discharge_tube.jpg",
            },
            {
                name: "Sulfur",
                image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/88/Sulfur_-_El_Desierto_mine%2C_San_Pablo_de_Napa%2C_Daniel_Campos_Province%2C_Potos%C3%AD%2C_Bolivia.jpg/330px-Sulfur_-_El_Desierto_mine%2C_San_Pablo_de_Napa%2C_Daniel_Campos_Province%2C_Potos%C3%AD%2C_Bolivia.jpg",
            },
            {
                name: "Mercury",
                image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/99/Pouring_liquid_mercury_bionerd.jpg/330px-Pouring_liquid_mercury_bionerd.jpg",
            },
            {
                name: "Neon",
                image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/46/Neon_discharge_tube.jpg/330px-Neon_discharge_tube.jpg",
            },
            {
                name: "Helium",
                image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/82/Helium_discharge_tube.jpg/330px-Helium_discharge_tube.jpg",
            },
            {
                name: "Uranium",
                image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d8/HEUraniumC.jpg/330px-HEUraniumC.jpg",
            },
        ],
    },
    {
        id: "classical",
        name: "Classical Elements",
        blurb: "Earth, wind, fire and friends",
        items: [
            {
                name: "Fire",
                image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/36/Large_bonfire.jpg/330px-Large_bonfire.jpg",
            },
            {
                name: "Water",
                image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b7/H2O_2D_labelled.svg/330px-H2O_2D_labelled.svg.png",
            },
            {
                name: "Earth",
                image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2d/Meteosat-12-fci-march-equinox-2025-noon.jpg/330px-Meteosat-12-fci-march-equinox-2025-noon.jpg",
            },
            {
                name: "Air",
                image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/be/Top_of_Atmosphere.jpg/330px-Top_of_Atmosphere.jpg",
            },
            {
                name: "Spirit",
                image: null,
            },
        ],
    },
];
